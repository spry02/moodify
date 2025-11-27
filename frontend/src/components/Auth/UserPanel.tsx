import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import {
	onAuthStateChanged,
	signOut,
	deleteUser,
	reauthenticateWithCredential,
	EmailAuthProvider,
} from "firebase/auth";

export default function UserPanel() {
	const [username, setUsername] = useState("...");
	const [open, setOpen] = useState(false);
	const [showReauth, setShowReauth] = useState(false);
	const [password, setPassword] = useState("");
	const panelRef = useRef<HTMLDivElement | null>(null);

	// Load username
	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (user) => {
			if (!user) return;

			const ref = doc(db, "users", user.uid);
			const snap = await getDoc(ref);

			if (snap.exists()) {
				setUsername(snap.data().username);
			}
		});
		return () => unsub();
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const handleLogout = async () => {
		await signOut(auth);
		window.location.reload();
	};

	// 🔥  REAUTH + DELETE  🔥
	const confirmDelete = async () => {
		if (!auth.currentUser || !auth.currentUser.email) return;

		try {
			// 1️⃣ Reauthenticate
			const cred = EmailAuthProvider.credential(
				auth.currentUser.email,
				password
			);

			await reauthenticateWithCredential(auth.currentUser, cred);

			// 2️⃣ Delete Firestore doc
			await deleteDoc(doc(db, "users", auth.currentUser.uid));

			// 3️⃣ Delete Firebase Auth user
			await deleteUser(auth.currentUser);

			// 4️⃣ Reload UI
			window.location.reload();
		} catch (err) {
			alert("Niepoprawne hasło. Spróbuj ponownie.");
		}
	};

	return (
		<div ref={panelRef} className="relative select-none">
			<div
				className="
		px-4 py-2 
		rounded-lg 
		bg-white/10 
		border border-white/20 
		text-white 
		placeholder-white/40
		hover:bg-white/15 
		focus:outline-none 
		focus:border-white/40 
		transition
		cursor-pointer
	"
				onClick={() => setOpen(!open)}
			>
				👤 {username}
			</div>

			{/* DROPDOWN */}
			{open && (
				<div
					className="
		absolute 
		right-0 mt-2 
		w-40 
		rounded-lg 
		bg-white/10 
		border border-white/20 
		backdrop-blur 
		p-2 
		shadow-lg 
		z-50
	"
				>
					<button
						className="block w-full text-left p-2 rounded hover:bg-white/20"
						onClick={handleLogout}
					>
						🔓 Wyloguj
					</button>

					<button
						className="block w-full text-left p-2 rounded hover:bg-red-400/30 text-red-300"
						onClick={() => {
							setOpen(false);
							setShowReauth(true);
						}}
					>
						🗑 Usuń konto
					</button>
				</div>
			)}

			{/* REAUTH MODAL */}
			{showReauth && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-sm w-full">
						<h2 className="text-xl text-white mb-4 font-semibold">
							Potwierdź hasło
						</h2>

						<input
							type="password"
							className="w-full p-2 rounded bg-black/30 text-white border border-white/20"
							placeholder="Podaj hasło"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>

						<div className="flex justify-end gap-3 mt-4">
							<button
								className="px-4 py-2 bg-white/20 rounded hover:bg-white/30"
								onClick={() => setShowReauth(false)}
							>
								Anuluj
							</button>

							<button
								className="px-4 py-2 bg-red-400/30 text-red-200 rounded hover:bg-red-400/40"
								onClick={confirmDelete}
							>
								Usuń konto
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
