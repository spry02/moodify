import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPopup() {
	const [mode, setMode] = useState<"login" | "register">("login");

const gradient = `
	bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(99,102,241,0.35),transparent)]
	bg-[radial-gradient(1200px_800px_at_-10%_30%,rgba(34,197,94,0.25),transparent)]
	bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]
`;

	return (
		<div
			className={`
		fixed inset-0 
		backdrop-blur-lg 
		flex items-center justify-center 
		z-50
		${gradient}
	`}
		>
			<div className="w-[420px] bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-white">
				{/* Switch login/register */}
				<div className="flex justify-center gap-6 mb-8">
					<button
						onClick={() => setMode("login")}
						className={`
							px-4 py-2 rounded-lg transition
							${
								mode === "login"
									? "bg-white/20 border border-white/40"
									: "opacity-60 hover:opacity-80"
							}
						`}
					>
						🔐 Logowanie
					</button>

					<button
						onClick={() => setMode("register")}
						className={`
							px-4 py-2 rounded-lg transition
							${
								mode === "register"
									? "bg-white/20 border border-white/40"
									: "opacity-60 hover:opacity-80"
							}
						`}
					>
						🧾 Rejestracja
					</button>
				</div>

				{mode === "login" ? <LoginForm /> : <RegisterForm />}
			</div>
		</div>
	);
}
