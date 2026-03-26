<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            
            [
                'id' => 2,
                'name' => 'Cherry Lyn S. Ramirez',
                'email' => 'ramirezcherry070104@gmail.com',
                'password' => '$2y$12$dhvhsXJnqzi9T3cWIM1vouZv3jxK18pp6t7PEOld.hcrttrRjE3sW',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => null,
                'created_at' => '2026-02-19 15:07:02',
                'updated_at' => '2026-02-19 15:55:39',
            ],
            [
                'id' => 3,
                'name' => 'Jhoanna Kylla Jericka C. Amistad',
                'email' => 'jhoannaamistad@gmail.com',
                'password' => '$2y$12$Sq7PG5xUVysVDTfKr2sbcuAlPFTb1kk9WbYcGCWr79SCy/SH16wCm',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => 'lw7I8WpD2eCuLTPrnJ7heLqI7wfHv1H6q2GR96jXnwDRw5A7btfcvS9NmYs0',
                'created_at' => '2026-02-19 15:07:45',
                'updated_at' => '2026-02-26 23:02:32',
            ],
            [
                'id' => 4,
                'name' => 'Princess Shaine Cueva',
                'email' => 'cuevaprincess95@gmail.com',
                'password' => '$2y$12$rEHkv9Oxhn20YDeghfsE/uNI91ciNBBczpYGZN4s3TEDzmt9YIcp2',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => 'R6nipJOGvOdmEd0kER7th6X1y9Oyt1NBDGA0Nv06hJMqOtNNSgESARsgYSNS',
                'created_at' => '2026-02-19 15:07:55',
                'updated_at' => '2026-02-19 15:56:00',
            ],
            [
                'id' => 5,
                'name' => 'Lucio Miguel C. Perez',
                'email' => 'luciomiguelperez@gmail.com',
                'password' => '$2y$12$AJbDUKt6bylXcSanxB2WQuIME2wz79e2Z9qDO484THdwfiVZNyy1i',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 486.00,
                'remember_token' => 'lTnjHB6PqeCwuRJ3cLV1kSRJLtTu9LBhP96vfjkL7W1mI1H8oRCwvgNWn79I',
                'created_at' => '2026-02-19 15:08:23',
                'updated_at' => '2026-02-19 19:03:08',
            ],
            [
                'id' => 6,
                'name' => 'Joyce Ann Garcia',
                'email' => 'jfanngarcia@gmail.com',
                'password' => '$2y$12$BJUdR5AX4t7eYvmp7ZtHReSNS6z0G/8POifPZzQ1GpXXiJT0rOZaC',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => '2w6bcpCSMvJKxqDeXt3fFe5WEs1wbDYq6nnI3WDwxViPv4dizhfYEhJqCsGo',
                'created_at' => '2026-02-19 15:08:46',
                'updated_at' => '2026-02-19 15:55:42',
            ],
            [
                'id' => 8,
                'name' => 'Marielle Denise Pamada',
                'email' => 'mariellebacligpamada@gmail.com',
                'password' => '$2y$12$WkwUqPHpcHCGbV4FcL.fU.HIAULYw5nozgmppLtNEUFrerZ03vMj.',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => 'gMCXQI8GecSN5fjuNLThvnxOPifNZYuvwn8ZFpYKh7XwaNDgSeyhXvaut9Je',
                'created_at' => '2026-02-19 15:11:14',
                'updated_at' => '2026-02-19 15:55:59',
            ],
            [
                'id' => 9,
                'name' => 'Mea Alexandra de Luna.',
                'email' => 'delavegamaeya@gmail.com',
                'password' => '$2y$12$sai.U4YrFpJRAeIiz/58Fel0m37lM37DnHlOQRvmA6NXdDi.9BBQy',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => null,
                'created_at' => '2026-02-19 15:12:51',
                'updated_at' => '2026-02-19 15:56:08',
            ],
            [
                'id' => 10,
                'name' => 'Brian Galicia',
                'email' => 'briangalicia000@gmail.com',
                'password' => '$2y$12$whvmf9lO2cTaYTq2vDZO4.JnE1l7xUhuR9Mw3y6gjDjdlkDu0Ao9u',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => 'xqN0AIbomdSTU7f3iaMAm1vNhnhZzwMpfhNmUw59wbeBQaSLMIAWLAc6IDSD',
                'created_at' => '2026-02-19 18:20:20',
                'updated_at' => '2026-02-19 18:23:28',
            ],
            [
                'id' => 11,
                'name' => 'Jayrald Sabido',
                'email' => 'jayraldevangelista22@gmail.com',
                'password' => '$2y$12$6lCo/4fK4RxYJ.QKP6kbIe33uAWj0cUtipSyRESdMjWGzWPsup57u',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => '8LTF01Wmk59oK6XJyck3UqkjyI6CIqcxUAS9wNnrmgi7G21fSnA8xTT537ZV',
                'created_at' => '2026-02-19 18:20:21',
                'updated_at' => '2026-03-17 12:58:28',
            ],
            [
                'id' => 12,
                'name' => 'REMSON NIKO FAMENIAL',
                'email' => 'famenialniko@gmail.com',
                'password' => '$2y$12$0KOFx646dn6q6jsKmM76SesBxq.nUWoN2LseswzUtdCI4PzTRPWQ6',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => 'DO4Yc446Jf5bo9rhkLjUY6MIdBTXOslcIQg0NRC5eAkVRAHfRb4FjPjGsJJY',
                'created_at' => '2026-02-19 18:21:18',
                'updated_at' => '2026-02-19 18:56:54',
            ],
            [
                'id' => 13,
                'name' => 'Jhonny',
                'email' => 'jhonny@arbitrage.com.ph',
                'password' => '$2y$12$qkxsLsu9.WSzzAtiG8YDgOoc0FXXn6wuy3U6h.ox6j8jtg7cAC26a',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 486.00,
                'remember_token' => 'UGvxN066Yz5FMmk2QMiT2Tr6kxcryQ1dFLzlZVMDbQeJrvYCm3CjLeNBwPZJ',
                'created_at' => '2026-02-19 18:49:52',
                'updated_at' => '2026-02-19 20:06:17',
            ],
            [
                'id' => 14,
                'name' => 'Mark John Wendell R. Silva',
                'email' => 'silvawendell220@gmail.com',
                'password' => '$2y$12$3RuQQ6n98l4bSLP8QOKLXeqNDoPK7zAtR9pOPjXSdS1yCLewUsn/S',
                'ojt_start_date' => null,
                'ojt_end_date' => null,
                'ojt_total_hours' => 240.00,
                'remember_token' => null,
                'created_at' => '2026-02-19 18:55:53',
                'updated_at' => '2026-02-19 18:58:22',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
