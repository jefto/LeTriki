import { useState } from 'react';
import backgroundImage from '../assets/tensionImg.jpg';
import logoTrikiRouge from '../assets/logoRouge-removebg-preview2.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative font-poppins"
            style={{
                backgroundImage: `url(${backgroundImage})`
            }}
        >
            {/* Logo en haut à droite */}
            <img src={logoTrikiRouge} alt="logoTrikiRouge" className="absolute top-4 right-4 w-32 md:w-40"/>

            {/* Container centré avec effet glass */}
            <div className="min-h-screen w-full flex items-center justify-center px-4">
                <div className="w-full max-w-md p-8 rounded-3xl backdrop-blur-sm bg-white/60 shadow-2xl border border-white/20">
                    <h1 className="text-4xl font-bold text-primary text-center mb-2">CONEXION</h1>
                    <p className="text-tertiary text-center font-semibold mb-2">Welcome back</p>
                    <p className="text-tertiary text-center text-sm font-light mb-8">
                        Prenez soin de bien entrer vos identifiant et de ne pas les partager
                        avec tierce personne.
                    </p>

                    {/* Nom d'utilisateur */}
                    <div className="mb-6">
                        <label className="block text-tertiary font-semibold mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-white backdrop-blur-sm border border text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
                            placeholder="Entrez votre nom d'utilisateur"
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className="mb-8">
                        <label className="block text-tertiary font-semibold mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tertiary/50 pr-12"
                                placeholder="Entrez votre mot de passe"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="w-6 h-6" />
                                ) : (
                                    <FaEye className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Bouton de connexion */}
                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                        Connexion
                    </button>
                </div>
            </div>

        </div>
    );
}