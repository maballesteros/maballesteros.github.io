import React from 'react';
import Spinner from './Spinner';
import './LoadingScreens.css'; // Import shared loading screen styles

interface SetupLoadingScreenProps {
  worldName: string;
}
const SetupLoadingScreen: React.FC<SetupLoadingScreenProps> = ({ worldName }) => (
  <section className="loading-screen" aria-labelledby="loading-heading-setup">
    <h2 id="loading-heading-setup">Tejiendo tu Nuevo Sueño...</h2>
    <p>Estamos consultando a las musas, generando el título, el primer sueño, forjando el arquetipo del héroe en {worldName} y escribiendo el inicio de su saga.</p>
    <Spinner ariaLabel="Cargando configuración de la aventura..." />
    <p><em>La inspiración está en camino... Un momento.</em></p>
  </section>
);

export default SetupLoadingScreen;