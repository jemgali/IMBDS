import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault(); // prevent page reload
        navigate('/Map');   // temporary redirect
    };
    return (
        <div className="h-full w-full bg-[#EDF1FA] flex flex-col items-center justify-center">
            <form onSubmit={handleLogin} className="space-y-6 w-full max-w-sm">
                <div className="rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username:
                    </label>
                    <input
                        type="text"
                        defaultValue="sample"
                        className="w-full px-4 font-bold text-black text-lg focus:outline-none"
                        name="username" />
                </div>
                <div className="rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password:
                    </label>
                    <input
                        type="password"
                        defaultValue="password"
                        className="w-full px-4 text-black text-lg focus:outline-none" />
                </div>
                <button
                    type="submit"
                    className="w-full bg-[#3F5BA9] text-white font-semibold py-3 rounded-xl shadow-md hover:bg-[#334a86] transition-all duration-200">
                    Login
                </button>
            </form>
        </div>
    );
}
