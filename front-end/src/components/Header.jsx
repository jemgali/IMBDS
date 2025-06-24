export default function Header() {
    return (
        <div className="w-full h-25 flex-shrink-0  bg-[rgb(63,91,169)]">
            <header className="relative flex items-center justify-between p-3 ">
                <div className="relative z-10 flex items-center gap-4 px-4">
                    <img src="src/assets/logo.png" className="h-20 w-auto object-contain" alt="Logo" />
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-white  ">Local Economic and Business Development Office</h2>
                        <hr className="text-white text-2xl w-145" />
                        <h2 className="text-xl font-bold text-white  ">Investible Mapping and Business Development System</h2>
                    </div>
                </div>
            </header>
        </div>
    );
}