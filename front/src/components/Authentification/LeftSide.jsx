import React from 'react';
import { IconBuildingBank, IconFileCheck, IconShieldLock, IconArrowUpRight } from '@tabler/icons-react';

const LeftSide = () => {
  return (
    <div className="hidden md:block md:w-2/5 relative bg-gradient-to-br from-blue-700 to-blue-800 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-800">
        <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full border border-white/10 backdrop-blur-sm" />
            <div className="absolute bottom-40 left-12 w-24 h-24 rounded-full border border-white/10 backdrop-blur-sm" />
            <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full border border-white/10 backdrop-blur-sm" />
            
            <div className="absolute top-40 right-1/3 w-4 h-4 rounded-full bg-white/5" />
            <div className="absolute bottom-1/3 right-24 w-6 h-6 rounded-full bg-white/5" />
            <div className="absolute top-1/4 left-20 w-3 h-3 rounded-full bg-white/5" />
            
            <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full bg-blue-400/10" />
            <div className="absolute bottom-20 left-1/3 w-8 h-8 rounded-full bg-blue-400/10" />
            
            <div className="absolute top-1/4 right-1/3 w-20 h-20 rounded-full border border-dashed border-white/10" />
            <div className="absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full border border-dashed border-white/10" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-600/5 to-blue-700/10" />
    </div>

      <div className="relative h-full">
        <div className="p-8 flex flex-col h-full">
          <div className="relative mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-xs font-medium text-blue-200 tracking-wider uppercase">
                Portail Public
              </span>
              <div className="flex-1 h-px bg-blue-400/20" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Mon
              <span className="relative">
                Service
                <div className="absolute -top-1 -right-3 w-2 h-2 bg-blue-400 rounded-full" />
              </span>
            </h1>
            <p className="text-blue-100/80 text-base max-w-sm">
              Votre espace numérique pour tous vos services administratifs
            </p>
          </div>

        
          <div className="space-y-4 mb-8">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                  <IconBuildingBank className="w-6 h-6 text-blue-200" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">Conservation Foncière</h3>
                    <IconArrowUpRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                    Gestion sécurisée de vos titres fonciers et documents administratifs
                  </p>
                  <div className="flex items-center gap-3 text-xs text-blue-200/80">
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm">
                      Titres Fonciers
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm">
                      Documents Légaux
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assurance Card */}
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                  <IconFileCheck className="w-6 h-6 text-blue-200" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">Assurance</h3>
                    <IconArrowUpRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                    Gérez vos contrats d'assurance et accédez à vos documents en ligne
                  </p>
                  <div className="flex items-center gap-3 text-xs text-blue-200/80">
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm">
                      Contrats
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm">
                      Déclarations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

       
          <div className="mt-auto">
            <div className="relative p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl backdrop-blur-md border border-white/10">
              <div className="absolute -right-2 -top-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-300/20 flex items-center justify-center">
                  <IconShieldLock className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="max-w-[80%]">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span className="text-xs font-medium text-blue-200">Sécurité Garantie</span>
                </div>
                <p className="text-xs text-blue-100/70 leading-relaxed">
                  Identification par carte d'identité pour une sécurité maximale de vos démarches administratives
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSide;