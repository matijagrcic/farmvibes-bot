<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\Uid\Uuid;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class DefaultValues extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'This migration preloads default values into the database for new platform installation.';
    }

    public function up(Schema $schema): void
    {       
        $defaultLanguage = "en";
        // Add default language
        $langId = Uuid::v4();
        $this->addSql('INSERT INTO language (id, created_at, updated_at, is_enabled, code, is_default, is_translatable) VALUES ("'.$langId.'",CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, "'.$defaultLanguage.'", 1, 1)');

        //Insert default channels
        $this->addSQL('INSERT INTO channel (id, name, is_enabled, created_at, updated_at, is_rich_text) VALUES
        ("'.Uuid::v4().'", "Telegram", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)');

        //Insert default language translation
        $this->addSql('INSERT INTO language_translation (id,name, locale, translatable_id) VALUES ("'.Uuid::v4().'","English", "'.$defaultLanguage.'", "'.$langId.'")'); 

         //Let's create service subtypes
         $regSubTypeId = Uuid::v4();
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.$regSubTypeId.'","registration","This defines a registration progress.")');
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.Uuid::v4().'","diagnosis","This defines a diagnostic service.")');
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.Uuid::v4().'","default","Default service type behaviour")');
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.Uuid::v4().'","evaluation","Responses to the prompts will be evaluated and graded against known values")');
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.Uuid::v4().'","api","Interaction will be handled entirely by an API service")');
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.Uuid::v4().'","survey","Default survey behaviour.")');
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.Uuid::v4().'","qna","Question and Answer Model behaviour.")');
         $this->addSql('INSERT INTO service_sub_type (id,name,description) VALUES ("'.Uuid::v4().'","delete profile","Delete profile that allows the bot user to delete their profile from the bot")');

         //Insert default services types
        $regTypeId = Uuid::v4();
        $this->addSql('INSERT INTO service_type (id,description,is_disabled,is_hidden) VALUES ("'.$regTypeId.'","Registration",1,0)');
        $surveyTypeId = Uuid::v4();
        $this->addSql('INSERT INTO service_type (id,description,is_disabled,is_hidden) VALUES ("'.$surveyTypeId.'","Survey",0,1)');
        $evaluationTypeId = Uuid::v4();
        $this->addSql('INSERT INTO service_type (id,description,is_disabled,is_hidden) VALUES ("'.$evaluationTypeId.'","Evaluation",0,0)');
        $diagnosisTypeId = Uuid::v4();
        $this->addSql('INSERT INTO service_type (id,description,is_disabled,is_hidden) VALUES ("'.$diagnosisTypeId.'","Diagnosis",1,0)');
        $searchEngineTypeId = Uuid::v4();
        $this->addSql('INSERT INTO service_type (id,description,is_disabled,is_hidden) VALUES ("'.$searchEngineTypeId.'","Search Engine",1,0)');        

        //Add service type translations
        $this->addSql('INSERT INTO service_type_translation (name,description, locale, id, translatable_id) VALUES ("Registration", "Defines the enrollment of end-users to your platform", "'.$defaultLanguage.'", "'.Uuid::v4().'", "'.$regTypeId.'")');//Add service type translations
        $this->addSql('INSERT INTO service_type_translation (name,description, locale, id, translatable_id) VALUES ("Survey", "A survey-like service where user is required to respond to pre-defined questions.", "'.$defaultLanguage.'", "'.Uuid::v4().'", "'.$surveyTypeId.'")');        
        $this->addSql('INSERT INTO service_type_translation (name,description, locale, id, translatable_id) VALUES ("Evaluation", "Question and answer service with grading on completion", "'.$defaultLanguage.'", "'.Uuid::v4().'", "'.$evaluationTypeId.'")');
        $this->addSql('INSERT INTO service_type_translation (name,description, locale, id, translatable_id) VALUES ("Diagnosis", "Service that allows users to identify issues through a series of questions.", "'.$defaultLanguage.'", "'.Uuid::v4().'", "'.$diagnosisTypeId.'")');
        $this->addSql('INSERT INTO service_type_translation (name,description, locale, id, translatable_id) VALUES ("Question & Answer", "Search engine that loops throught the content to get matching texts for the bot user.", "'.$defaultLanguage.'", "'.Uuid::v4().'", "'.$searchEngineTypeId.'")');

        //Create registration service
        $regId = Uuid::v4();
        $this->addSql('INSERT INTO service (id, is_published, created_at, updated_at, single_access, back_after_completion, type_id, subtype_id, is_system) VALUES 
        ("'.$regId.'", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 0, "'.$regTypeId.'", "'.$regSubTypeId.'", 1)');

        //Insert registration service translation
        $this->addSql('INSERT INTO service_translation (id,name, locale, introduction, conclusion, translatable_id) VALUES 
        ("'.Uuid::v4().'","User registration", "'.$defaultLanguage.'", "Welcome to our service, I would like to ask you a few questions before you proceed.", "Registration successful!", "'.$regId.'")');

        //Insert menu node types
        $this->addSQL('INSERT INTO menu_node_type (id, name) VALUES ("'.Uuid::v4().'", "main"),("'.Uuid::v4().'", "branch"),("'.Uuid::v4().'", "content"),("'.Uuid::v4().'", "service");');

        //Insert type of questions
        $textFieldId = Uuid::v4();
        $textBoxFieldId = Uuid::v4();
        $checkListFieldId = Uuid::v4();
        $sIconFieldId = Uuid::v4();
        $this->addSQL('INSERT INTO question_type (id, is_published, created_at, updated_at, icon, has_options) VALUES 
        ("'.$textFieldId.'", 1, CURRENT_TIMESTAMP, NULL, "TextField", 0), 
        ("'.$textBoxFieldId.'", 1, CURRENT_TIMESTAMP, NULL, "TextBox", 0), 
        ("'.$checkListFieldId.'", 1, CURRENT_TIMESTAMP, NULL, "CheckList", 1),
        ("'.$sIconFieldId.'", 1, CURRENT_TIMESTAMP, NULL, "SIcon", 0)');

        //Question type translations
        $this->addSQL('INSERT INTO question_type_translation (id, name, description, locale, translatable_id) VALUES
        ("'.$textFieldId.'", "Short text", "User will be required to enter a short response", "'.$defaultLanguage.'", "'.$textFieldId.'"),
        ("'.$textBoxFieldId.'", "Long Text", "This allows the user to send back a prose response to the platform", "'.$defaultLanguage.'", "'.$textBoxFieldId.'"),
        ("'.$checkListFieldId.'", "Choice", "A question that will present users with options to select from.", "'.$defaultLanguage.'", "'.$checkListFieldId.'"),
        ("'.$sIconFieldId.'", "Look-up", "User will select options in the platform e.g. administrative locations", "'.$defaultLanguage.'", "'.$sIconFieldId.'");');

        //Insert question type attributes
        $requiredId = Uuid::v4();
        $multipleId = Uuid::v4();
        $shuffleId = Uuid::v4();
        $optionsOnlyId = Uuid::v4();
        $this->addSQL('INSERT INTO question_type_attribute (id, default_value, is_published, created_at, updated_at) VALUES 
        ("'.$requiredId.'", 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ("'.$multipleId.'", 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ("'.$shuffleId.'", 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ("'.$optionsOnlyId.'", 0, 1, CURRENT_TIMESTAMP, NULL);');

        //Question types attribute translations
        $this->addSQL('INSERT INTO question_type_attribute_translation (id, translatable_id, name, locale) VALUES 
        ("'.Uuid::v4().'", "'.$requiredId.'", "Required", "'.$defaultLanguage.'"), 
        ("'.Uuid::v4().'", "'.$multipleId.'", "Multiple choice", "'.$defaultLanguage.'"), 
        ("'.Uuid::v4().'", "'.$shuffleId.'", "Shuffle Options", "'.$defaultLanguage.'"), 
        ("'.Uuid::v4().'", "'.$optionsOnlyId.'", "Options only", "'.$defaultLanguage.'");');
        
        
        //Insert question type attributes to question types
        $this->addSQL('INSERT INTO question_type_attribute_question_type (question_type_attribute_id, question_type_id) VALUES 
        ("'.$requiredId.'", "'.$textFieldId.'"),
        ("'.$requiredId.'", "'.$textBoxFieldId.'"),
        ("'.$requiredId.'", "'.$checkListFieldId.'"),
        ("'.$requiredId.'", "'.$sIconFieldId.'"),
        ("'.$multipleId.'", "'.$checkListFieldId.'"),
        ("'.$shuffleId.'", "'.$checkListFieldId.'"),
        ("'.$optionsOnlyId.'", "'.$checkListFieldId.'");');

        //Insert registration questions
        $langGuid = Uuid::v4();
        $this->addSQL('INSERT INTO question (id, question_type_id, service_id, created_at, updated_at, attributes, position, is_published, description, is_system, content_look_up) VALUES 
        ("'.$langGuid.'","'.$sIconFieldId.'","'.$regId.'",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,\'a:4:{i:0;a:3:{s:2:"id";s:36:'.$requiredId.';s:5:"value";b:1;s:4:"name";s:8:"Required";}i:1;a:3:{s:2:"id";s:36:'.$multipleId.';s:5:"value";b:1;s:4:"name";s:15:"Multiple choice";}i:2;a:3:{s:2:"id";s:36:'.$shuffleId.';s:5:"value";b:0;s:4:"name";s:15:"Shuffle Options";}i:3;a:3:{s:2:"id";s:36:'.$optionsOnlyId.';s:5:"value";b:0;s:4:"name";s:12:"Options only";}}\',1,1,"language",1,
        \'{"key": "name", "value": "code", "entity": "languages"}\')');
        
        $nameGuid = Uuid::v4();
        $this->addSQL('INSERT INTO question (id, question_type_id, service_id, created_at, updated_at, attributes, position, is_published, description, is_system) VALUES 
        ("'.$nameGuid.'","'.$textFieldId.'","'.$regId.'",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,\'a:1:{i:0;a:3:{s:2:"id";s:36:'.$requiredId.';s:5:"value";b:1;s:4:"name";s:8:"Required";}}\',2,1,"fullname",1)');

        //Insert translations for reg questions
        $this->addSQL('INSERT INTO question_translation (id, question, hint, locale, translatable_id) VALUES
        ("'.Uuid::v4().'", "Which language would you prefer to use?", "Please select a language you are comfortable with.", "'.$defaultLanguage.'", "'.$langGuid.'"),
        ("'.Uuid::v4().'", "What is your name?", "Your name helps me refer to you in a personal way.", "'.$defaultLanguage.'", "'.$nameGuid.'")');

        //Add constraints
        $channelConstraints = Uuid::v4();
        $locationsConstraints = Uuid::v4();
        $questionsConstraints = Uuid::v4();
        $this->addSQL('INSERT INTO `constraints` (`id`, `created_at`, `updated_at`, `entity`, `data_paths`) VALUES
        ("'.$channelConstraints.'", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "channel", "[{\"path\": \"channels\", \"propertyName\": \"name\", \"propertyValue\": \"id\"}]"),
        ("'.$locationsConstraints.'", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "locations", "[{\"path\": \"administrative_units\", \"propertyName\": \"name\", \"propertyValue\": \"id\"}]"),
        ("'.$questionsConstraints.'", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "profile", "[{\"path\": \"services/'.$regId.'/questions?groups[]=uxConstraints:read\", \"propertyName\": \"question\", \"propertyValue\": \"id\"}]")
        ');

        //Add constraints translations
        $this->addSQL("INSERT INTO `constraint_translation` (`id`, `name`, `description`, `locale`, `translatable_id`) VALUES 
        ('".Uuid::v4()."', 'Channel', 'Limit access to selected channels', 'en', '".$channelConstraints."'),
        ('".Uuid::v4()."', 'Administrative units', 'Filter by administrative units', 'en', '".$locationsConstraints."'),
        ('".Uuid::v4()."', 'User Profile', 'Allow access only to users who meet stipulated criteria', 'en', '".$questionsConstraints."');
        ");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
