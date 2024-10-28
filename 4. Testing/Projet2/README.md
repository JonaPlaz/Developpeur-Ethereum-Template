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

0. Déploiement du contrat
1. Get Voter
- Vérifie que seul un électeur enregistré récupérer les informations d'un voter.
- Confirme que le voter est bien enregistré.
2. Get One Proposal
- Vérifie que seul un électeur enregistré récupérer les informations d'un voter.
- Confirme que la première proposal par défaut est "GENESIS".
- Confirme que les infos de la proposal appelée sont correctes.
- vérifie l'id de la proposal.
3. Add Voter
- Assure que seul le propriétaire peut ajouter un électeur.
- Vérifie que l'ajout d'un électeur n'est possible que pendant la phase d'enregistrement des électeurs.
- Vérifie que l'ajout répété d'un électeur est interdit.
- Vérifie que l'évènement VoterRegistered est emit.
4. Add Proposal
- Vérifie que seul un électeur peut ajouter une proposal.
- Assure que les proposals ne peuvent être soumises que pendant la période d'enregistrement des proposals.
- Empêche les proposals vides.
- Vérifie que l'évènement ProposalRegistered est emit.
5. Set Vote
- Assure que seul un électeur peut voter
- Vérifie que le vote ne peut se faire que pendant la session de vote.
- Empêche un électeur de voter plusieurs fois.
- Vérifie qu’un vote pour une proposal non existante est rejeté.
- Vérifie que l'évènement Voted est emit.
6. Phase Change Status
* Start Proposals Registering : 
- Assure que seul le owner peut démarrer l'enregistrement des proposals.
- Vérifie que le status avant l'update du status
- Vérifie que l'évènement du changement de status est emit
* End Proposals Registering : 
- Vérifie que l'enregistrement des proposals se termine correctement.
- Vérifie que le status avant l'update du status
- Vérifie que l'évènement du changement de status est emit.
* Start Voting Session : 
- Assure que seul le propriétaire peut démarrer la session de vote.
- Vérifie que le status avant l'update du status
- Vérifie que l'évènement du changement de status est emit.
* End Voting Session : 
- Vérifie que la session de vote se termine correctement.
- Vérifie que le status avant l'update du status
- Vérifie que l'évènement du changement de status est emit.
7. Tally Votes
- Assure que seul le propriétaire peut comptabiliser les votes
- Vérifie que la session de vote est terminée
- Vérifie que l'évènement de changement de status est emit.
- Sélectionne la proposal avec le plus grand nombre de voix.
- Assure que la proposal GENESIS est sélectionnée en cas d'absence de vote.

## Objectif des tests
Obtenir un Coverage de 100%.