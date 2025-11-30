import { useState } from 'react';
import backgroundImage from '../assets/tensionImg.jpg';
import logoTrikiRouge from '../assets/logoRouge-removebg-preview2.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen w-full flex font-poppins">
            {/* Hero Section - Partie gauche avec image de fond */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
                style={{
                    backgroundImage: `url(${backgroundImage})`
                }}
            >
                {/* Box avec effet verre contenant logo et description */}
                <div className="relative z-10 flex items-center justify-center w-full p-12">
                    <div className="backdrop-blur-sm bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md">
                        <img
                            src={logoTrikiRouge}
                            alt="Logo Triki Rouge"
                            className="w-48 mx-auto mb-6"
                        />
                        <p className="text-tertiary text-center text-sm font-medium leading-relaxed">
                            Plateforme d'analyse et de prevision énergetique
                            Compagnie d'Energie Electrique du Togo


                            {/*Plateforme web dédiée à la centralisation, à l'analyse et à la visualisation dynamique des données de consommation électrique au Togo*/}
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulaire de connexion - Partie droite sur fond blanc */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo mobile visible uniquement sur petits écrans */}
                    <div className="lg:hidden mb-8 text-center">
                        <img
                            src={logoTrikiRouge}
                            alt="Logo Triki Rouge"
                            className="w-32 mx-auto mb-4"
                        />
                    </div>

                    <h1 className="text-4xl font-bold text-primary text-center mb-2">CONNEXION</h1>
                    <p className="text-tertiary text-center font-semibold mb-10">Welcome back</p>

                    {/* Nom d'utilisateur */}
                    <div className="mb-6">
                        <label className="block text-tertiary font-semibold mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tertiary/50 focus:border-tertiary"
                            placeholder="Entrez votre nom d'utilisateur"
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className="mb-4">
                        <label className="block text-tertiary font-semibold mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tertiary/50 focus:border-tertiary pr-12"
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

                    {/* Mot de passe oublié */}
                    <div className="flex justify-end mb-8">
                        <button className="text-sm text-tertiary hover:text-primary transition-colors">
                            Mot de passe oublié ?
                        </button>
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

