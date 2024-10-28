# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
# TESTS UNITAIRES

## Description des tests
Les tests sont organisés en différentes sections correspondant aux fonctionnalités principales du contrat Voting :

1. Get Voter
Vérifie que seul un électeur enregistré peut consulter son statut.
Assure que les informations renvoyées pour un électeur enregistré sont correctes.
2. Get One Proposal
Vérifie qu'un électeur non enregistré ne peut pas accéder aux propositions.
Assure que la proposition de base (GENESIS) est correctement renvoyée au début du processus.
Valide que les propositions sont bien récupérables par leur ID.
3. Add Voter
Assure que seul le propriétaire peut ajouter un électeur.
Vérifie que l'ajout d'un électeur n'est possible que pendant la phase d'enregistrement des électeurs.
Valide l'enregistrement correct d'un électeur et vérifie que l'ajout répété est interdit.
4. Add Proposal
Vérifie que seul un électeur peut ajouter une proposition.
Assure que les propositions ne peuvent être soumises que pendant la période d'enregistrement des propositions.
Empêche les propositions vides.
5. Set Vote
Assure que seul un électeur peut voter et que le vote ne peut se faire que pendant la session de vote.
Empêche un électeur de voter plusieurs fois.
Vérifie qu’un vote pour une proposition non existante est rejeté.
6. Phase Management
Start Proposals Registering : Assure que seul le propriétaire peut démarrer l'enregistrement des propositions.
End Proposals Registering : Vérifie que l'enregistrement des propositions se termine correctement.
Start Voting Session : Assure que seul le propriétaire peut démarrer la session de vote.
End Voting Session : Vérifie que la session de vote se termine correctement.
Tally Votes : Assure que seul le propriétaire peut comptabiliser les votes et sélectionne la proposition avec le plus grand nombre de voix.
7. Tally Votes
Valide que la proposition ayant obtenu le plus de votes est déclarée gagnante.
Assure que la proposition GENESIS est sélectionnée en cas d'absence de vote.

## Objectif des tests
Ces tests permettent de garantir la sécurité et la fiabilité du processus de vote en s’assurant que seules les personnes autorisées peuvent interagir avec le contrat dans les phases appropriées et que les restrictions sont bien appliquées pour éviter les abus.