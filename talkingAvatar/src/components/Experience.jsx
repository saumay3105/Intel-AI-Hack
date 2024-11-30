import { Environment, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";

export const Experience = ({isCorrect}) => {
  return (
    <>
      <OrbitControls />
      <Avatar position={[0, -3, 5]} scale={2} isCorrect={isCorrect}/>
      <Environment preset="sunset"/>
    
      
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#ececec" /> 
      </mesh> 
    </>
  );
};
