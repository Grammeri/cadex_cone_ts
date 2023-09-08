import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BufferGeometry,
  BufferAttribute,
} from 'three';

type Triangle = {
  x: number;
  y: number;
  z: number;
};

function App() {
  const [height, setHeight] = useState(10);
  const [radius, setRadius] = useState(5);
  const [segments, setSegments] = useState(12);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const coneDisplay = document.getElementById('cone-display');

    let cone: Mesh;

    if (coneDisplay) {
      coneDisplay.innerHTML = '';
      coneDisplay.appendChild(renderer.domElement);
    }

    if (geometry) {
      const material = new MeshBasicMaterial({ color: 0x00ff00 });
      cone = new Mesh(geometry, material);
      scene.add(cone);
      camera.position.z = 20;
    }

    const animate = function () {
      requestAnimationFrame(animate);
      if (cone) {
        cone.rotation.x += 0.005;
        cone.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };

    animate();

    // Чистка
    return () => {
      if (cone) scene.remove(cone);
    };
  }, [geometry]);

  const handleCompute = async () => {
    try {
      const response = await axios.post('http://localhost:3001/compute', { height, radius, segments });
      const triangles: Triangle[] = response.data;

      const geometry = new BufferGeometry();
      const vertices = new Float32Array(triangles.flat().map((t: Triangle) => [t.x, t.y, t.z]).flat());
      geometry.setAttribute('position', new BufferAttribute(vertices, 3));

      setGeometry(geometry);
    } catch (error) {
      console.error("Error while computing:", error);
    }
  };

  return (
      <div className="app-wrapper">
        <div className="form-wrapper">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCompute();
          }}>
            <div>
              <label>
                Cone height
                <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                />
              </label>
            </div>
            <div>
              <label>
                Cone radius:
                <input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                />
              </label>
            </div>
            <div>
              <label>
                Number of segments:
                <input
                    type="number"
                    value={segments}
                    onChange={(e) => setSegments(Number(e.target.value))}
                />
              </label>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
        <div id="cone-display" className="cone-display">

        </div>
      </div>
  );
}

export default App;

