export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white shadow-md overflow-hidden">
                <img src="/logo/ArbitrageInc.png" alt="Arbitrage Inc Logo" className="size-8 object-contain" />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold leading-tight text-foreground">
                    OJT Attendance
                </span>
                <span className="text-xs font-medium leading-tight text-muted-foreground">
                    Arbitrage Inc.
                </span>
            </div>
        </div>
    );
}
