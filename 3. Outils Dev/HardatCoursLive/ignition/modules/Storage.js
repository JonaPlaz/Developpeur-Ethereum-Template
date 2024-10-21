require('dotenv').config();  // Charger les variables d'environnement depuis le fichier .env
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const NUMBER = 1;

module.exports = buildModule("StorageModule", (m) => {
    // Déployer le contrat Storage depuis une adresse spécifique
    const storage = m.contract("Storage");

    // Ajouter une transaction pour appeler la fonction `store` après le déploiement
    m.call(storage, "store", [NUMBER]);

    return { storage };
});
