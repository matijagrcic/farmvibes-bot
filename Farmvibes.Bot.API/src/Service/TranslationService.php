<?php
namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ContainerBagInterface;

class TranslationService
{
    private $params;

    public function __construct(ContainerBagInterface $params)
    {
        $this->params = $params;
    }


    /**
     * This helper function gets translations in all provided languages from the Microsoft translator service 
     *
     * @return void
     */
    public function getTranslations(array $data): array
    {
        /*
        Source language to translate from.
         This parameter can be optional as the translator service has a capability to auto detect 
         the source language. 
         */ 
        $params = "&from=". $data['from'];
        /*
         Target language or languages to translate to. This parameter is required.
        */
        $targetLanguages = $data['to'];
        foreach($targetLanguages as $targetLanguage)
        {
          $params = $params . "&to=". $targetLanguage;
        }

        $text = $data['text'];
        $path = $this->params->get("TRANSLATOR_TEXT_PATH");
        $subscription_key = $this->params->get("TRANSLATOR_TEXT_SUBSCRIPTION_KEY");  
        $endpoint = $this->params->get("TRANSLATOR_TEXT_ENDPOINT");
        $location = $this->params->get("TRANSLATOR_LOCATION");

        $requestBody = array (
            array (
                'Text' => $text,
            ),
        );

        $content = json_encode($requestBody);

        $headers = array("Content-type: application/json; charset=UTF-8",
            "Content-length: ". strlen($content),"Ocp-Apim-Subscription-Key:". $subscription_key,
            "Ocp-Apim-Subscription-Region:". $location);
    

        $ch = curl_init();
        $curl_content = array('content', $content);

        curl_setopt($ch, CURLOPT_URL, $endpoint . $path . $params);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
        // Receive server response ...
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);


        $result = curl_exec($ch);

        if (curl_exec($ch) === false) {
            print_r(curl_error($ch));
        }
        $translationResult = json_decode($result,true);
        return $translationResult == null || array_key_exists("error", $translationResult) ? ['status' => 'error'] : ['status' => 'success', "translations" => $translationResult[0]['translations']];
    }

    /**
     * This helper function gets a list of languages supported the translator service 
     *
     * @return void
     */
    public function getTranslationLanguages(): string
    {
        $headers = "Content-type: text/xml\r\n";       
        $endpoint = $this->params->get("TRANSLATOR_TEXT_ENDPOINT");
        $path = $this->params->get("TRANSLATOR_LANGUAGE_PATH");
        
        // NOTE: Use the key 'http' even if you are making an HTTPS request. See:
        // http://php.net/manual/en/function.stream-context-create.php
        $options = array (
            'http' => array (
                'header' => $headers,
                'method' => 'GET'
            )
        );
        $context  = stream_context_create ($options);
        $result = file_get_contents ($endpoint . $path, false, $context);
        return $result;
    }
    
}