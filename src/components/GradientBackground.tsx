'use client';

import React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* ShaderGradient 背景 */}
      <div className="fixed inset-0 -z-10">
        <ShaderGradientCanvas
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <ShaderGradient
            animate="on"
            type="waterPlane"
            color1="#66ff78"
            color2="#dbba95"
            color3="#c4c4e1"
            cDistance={20}
            cPolarAngle={90}
            cAzimuthAngle={180}
            cameraZoom={1.2}
            lightType="3d"
            envPreset="city"
            grain="on"
            zoomOut={true}
            uSpeed={0.2}
            uStrength={7}
            uDensity={1.5}
            uFrequency={5.5}
            uAmplitude={2.3}
            positionX={-1.4}
            positionY={0}
            positionZ={0}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            reflection={0.1}
            brightness={1.2}
          />
        </ShaderGradientCanvas>
      </div>
      
      {/* 半透明覆蓋層，提高內容可讀性 */}
      <div className="fixed inset-0 bg-background/90 backdrop-blur-[2px] -z-10"></div>
      
      {/* 內容 */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground; 