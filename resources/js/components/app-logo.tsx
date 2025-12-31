export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md overflow-hidden bg-white">
                <img 
                    src="/assets/logo.png" 
                    alt="Attendify" 
                    className="size-8 object-contain"
                />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-bold text-lg text-blue-600">
                    COMPANY
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Attendance System
                </span>
            </div>
        </>
    );
}
