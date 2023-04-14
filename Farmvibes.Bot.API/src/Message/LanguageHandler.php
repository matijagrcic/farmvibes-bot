<?php

namespace App\Message;

use Doctrine\ORM\EntityManagerInterface;
use App\Service\TranslationService;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class LanguageHandler
{
    private EntityManagerInterface $entityManager;
    private $translationService;
    function __construct(EntityManagerInterface $entityManager, TranslationService $translationService)
    {
        $this->entityManager = $entityManager;
        $this->translationService = $translationService;
    }
    public function __invoke(LanguageMessage $message)
    {
        //Get schema manager
        $sm = $this->entityManager->getConnection()->createSchemaManager();
        //Get all databases and without system tables. The list is from mysql, more databases to be added.
        $databases = array_filter(
            $sm->listDatabases(),
            function ($arr) {
                return $arr != "performance_schema" && $arr != "information_schema" && $arr != "sys" && $arr != "mysql" && $arr != "pg_catalog";
            }
        );

        //For each database, we need to 
        foreach ($databases as $database) {
            $connection = $this->entityManager->getConnection()->getNativeConnection();
            $connection->exec('SET FOREIGN_KEY_CHECKS = 0');
            $tables = $sm->listTableNames($database);
            //Let's get sequences
            foreach ($tables as $table) {
                //If it's not a table that contains translations, please skip
                if (!str_contains($table, 'translation'))
                    continue;

                //Get default language data for translation
                $dq = "SELECT * FROM " . $table . " WHERE locale = :defaultLocale";
                $query = $this->entityManager->getConnection()->prepare($dq);
                $query->bindValue(':defaultLocale', 'en');
                $inDefaultLanguages = $query->executeQuery()->fetchAllAssociative();
                if (count($inDefaultLanguages) < 1)
                    continue;

                //For each row in default languag,e 
                //we will take all columns to build insert dynamic query
                //then translate values if possible for persistence
                foreach ($inDefaultLanguages as $inDefaultLanguage) {
                    $columns = array_keys($inDefaultLanguage);

                    //Let's get all columns in a comma separated string
                    $insertKeys = implode(",", $columns);

                    //To avoid SQL injection vulnarabilities, we will bing column values to parameters
                    // end result will be something like this 
                    //INSERT INTO (id, translatable_id, locale,....) VALUES (:id, :translatable_id, :locale, ...)
                    $insertValues = implode(",:", $columns);
                    $insertQuery = "INSERT INTO " . $table . " ({$insertKeys}) VALUES (:" . $insertValues . ")";
                    $statement = $this->entityManager->getConnection()->prepare($insertQuery);
                    foreach ($columns as $column) {
                        if ($column == 'locale' || $column == 'translatable_id' || $column == 'id')
                            continue;

                        //If language is translatable or olumn value is not null, let's attempt to translate
                        //Otherwise assign value in default language
                        if ($message->isIsTranslatable() && $inDefaultLanguage[$column] !== null) {
                            $translationResult = $this->translationService->getTranslations(['from' => 'en', 'text' => $inDefaultLanguage[$column], 'to' => [$message->getLanguageCode()]]);
                            //If we encounter an error while attempting to translate, 
                            //Assign text in default language
                            //Otherwise assign value from Microsoft Translator
                            if ($translationResult["status"] == "error")
                                $statement->bindValue($column, $inDefaultLanguage[$column]);
                            else
                                $statement->bindValue($column, $translationResult["translations"][0]['text']);
                        } else
                            $statement->bindValue($column, $inDefaultLanguage[$column]);

                        $statement->bindValue("translatable_id", $inDefaultLanguage["translatable_id"]);
                        $statement->bindValue("locale", $message->getLanguageCode());
                        $statement->bindValue("id", Uuid::v4());
                    }
                    $result = $statement->execute();
                }
            }
            $connection->exec('SET FOREIGN_KEY_CHECKS = 1');
        }
    }
}
