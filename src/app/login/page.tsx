import { login } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const error = searchParams?.error;

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black p-4">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>

            <div className="relative z-10 bg-[#0a0a0a] border border-white/10 p-10 rounded-[2rem] w-full max-w-md shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">Command Center</h2>
                <p className="text-gray-400 mb-8 text-center">Authentication Protocol</p>

                {error && (
                    <div className="mb-6 p-4 rounded-[1rem] bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form action={login} className="space-y-4">
                    <div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Admin Email"
                            defaultValue="jumpleadsjl@gmail.com"
                            required
                            className="w-full bg-[#151515] border border-white/5 rounded-[1rem] p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                            className="w-full bg-[#151515] border border-white/5 rounded-[1rem] p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white text-black font-bold py-4 rounded-[1.5rem] hover:bg-gray-200 transition-all duration-300 mt-2 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    )
}
