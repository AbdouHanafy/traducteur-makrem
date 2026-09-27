-- L'administrateur assure aussi le travail de traduction : les anciens comptes traducteurs
-- conservent leur accès en devenant administrateurs avant de réduire l'enum.
UPDATE `User` SET `role` = 'ADMIN' WHERE `role` = 'TRANSLATOR';

ALTER TABLE `User`
  MODIFY `role` ENUM('CLIENT', 'ADMIN') NOT NULL DEFAULT 'CLIENT';
