CREATE TABLE `nodejs_login`.`users` (`id` BIGINT NOT NULL AUTO_INCREMENT ,
`name` VARCHAR(100) NOT NULL , `email` VARCHAR(150) NOT NULL ,
`password` VARCHAR(255) NOT NULL ,
PRIMARY KEY (`id`)) ENGINE = InnoDB;