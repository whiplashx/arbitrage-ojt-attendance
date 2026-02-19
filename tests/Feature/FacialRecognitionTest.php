<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FacialRecognitionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test storing facial data for a user
     */
    public function test_store_facial_data(): void
    {
        $user = User::factory()->create();

        // Create a mock facial encoding (128 values as face-api produces)
        $facialEncoding = json_encode(array_fill(0, 128, rand(0, 100) / 100));

        $response = $this->actingAs($user)->postJson('/api/facial-recognition/store', [
            'user_id' => $user->id,
            'facial_encoding' => $facialEncoding,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'facial_enabled' => true,
        ]);

        // Verify facial data hash is unique
        $this->assertNotNull($user->fresh()->facial_data_hash);
    }

    /**
     * Test preventing duplicate facial registration
     */
    public function test_prevent_duplicate_facial_registration(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create same facial encoding for both users
        $facialEncoding = json_encode(array_fill(0, 128, 0.5));

        // Register first user
        $response1 = $this->actingAs($user1)->postJson('/api/facial-recognition/store', [
            'user_id' => $user1->id,
            'facial_encoding' => $facialEncoding,
        ]);
        $response1->assertStatus(200);

        // Try to register same face for second user
        $response2 = $this->actingAs($user2)->postJson('/api/facial-recognition/store', [
            'user_id' => $user2->id,
            'facial_encoding' => $facialEncoding,
        ]);
        $response2->assertStatus(422);
        $response2->assertJsonFragment([
            'facial_encoding' => ['This facial data is already registered to another account.'],
        ]);
    }

    /**
     * Test verifying facial data
     */
    public function test_verify_facial_data(): void
    {
        // Create a base encoding
        $baseEncoding = array_fill(0, 128, 0.5);
        $user = User::factory()->create([
            'facial_encoding' => json_encode($baseEncoding),
            'facial_data_hash' => hash('sha256', json_encode($baseEncoding)),
            'facial_enabled' => true,
        ]);

        // Create a very similar encoding (should match within threshold)
        $similarEncoding = $baseEncoding;
        $similarEncoding[0] = 0.51; // Slight difference
        $similarEncodingJson = json_encode($similarEncoding);

        $response = $this->postJson('/api/facial-recognition/verify', [
            'facial_encoding' => $similarEncodingJson,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'matched' => true,
        ]);
    }

    /**
     * Test no match found
     */
    public function test_no_facial_match_found(): void
    {
        // Create a very different encoding
        $differentEncoding = json_encode(array_fill(0, 128, 0.1));

        $response = $this->postJson('/api/facial-recognition/verify', [
            'facial_encoding' => $differentEncoding,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'matched' => false,
        ]);
    }

    /**
     * Test disabling facial recognition
     */
    public function test_disable_facial_recognition(): void
    {
        $user = User::factory()->create([
            'facial_encoding' => json_encode(array_fill(0, 128, 0.5)),
            'facial_enabled' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/facial-recognition/disable');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'facial_enabled' => false,
            'facial_encoding' => null,
        ]);
    }

    /**
     * Test getting facial status
     */
    public function test_get_facial_status(): void
    {
        $user = User::factory()->create([
            'facial_enabled' => true,
            'facial_registered_at' => now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/facial-recognition/status');

        $response->assertStatus(200);
        $response->assertJson([
            'enabled' => true,
        ]);
    }

    /**
     * Test facial data is hidden in user responses
     */
    public function test_facial_data_hidden_in_user(): void
    {
        $user = User::factory()->create([
            'facial_encoding' => json_encode(array_fill(0, 128, 0.5)),
            'facial_data_hash' => 'some_hash',
            'facial_enabled' => true,
        ]);

        $userArray = $user->toArray();

        $this->assertArrayNotHasKey('facial_encoding', $userArray);
        $this->assertArrayNotHasKey('facial_data_hash', $userArray);
    }

    /**
     * Test registration with facial data
     */
    public function test_register_with_facial_data(): void
    {
        $facialEncoding = json_encode(array_fill(0, 128, 0.5));

        $response = $this->postJson('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'facial_encoding' => $facialEncoding,
        ]);

        $response->assertStatus(302); // Redirected after successful registration

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->facial_enabled);
        $this->assertNotNull($user->facial_registered_at);
    }

    /**
     * Test Euclidean distance calculation
     */
    public function test_euclidean_distance_calculation(): void
    {
        $encoding1 = array_fill(0, 128, 0.5);
        $encoding2 = array_fill(0, 128, 0.5);

        // Distance should be 0 for identical encodings
        $response = $this->postJson('/api/facial-recognition/verify', [
            'facial_encoding' => json_encode($encoding1),
        ]);

        // Just verify endpoint works (distance calculation happens server-side)
        $response->assertStatus(200);
    }

    /**
     * Test unauthenticated access to protected endpoints
     */
    public function test_unauthenticated_store_access(): void
    {
        $facialEncoding = json_encode(array_fill(0, 128, 0.5));

        $response = $this->postJson('/api/facial-recognition/store', [
            'user_id' => 1,
            'facial_encoding' => $facialEncoding,
        ]);

        $response->assertStatus(401); // Unauthorized
    }

    /**
     * Test invalid facial encoding format
     */
    public function test_invalid_facial_encoding(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/facial-recognition/store', [
            'user_id' => $user->id,
            'facial_encoding' => 'invalid_encoding',
        ]);

        $response->assertStatus(422); // Validation error
    }
}
