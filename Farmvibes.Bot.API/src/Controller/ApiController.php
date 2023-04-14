<?php
namespace App\Controller;
 
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * This class has endpoints that are used for interacting with external APIs.
 */ 
class ApiController extends AbstractController
{    

     /**
     * The text translation request to the translator service are parsed and forwarded to 
     *  translator service.
     *  example api post: api/get_translation?from=en&to[]=fr&to[]=de&text=Hello, what is your name?
     *  translates text from english language to french and german languages respectively.
     * 
     * @Route("/api/get_translation", name="api_get_translation_data")
     */
    public function get_translation (Request $request) : Response
    {    
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $data = json_decode($request->getContent(), true);
        }
        else
        {
            $data = $request->query->all();
        }
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
        $path = $this->getParameter("TRANSLATOR_TEXT_PATH");
        $subscription_key = $this->getParameter("TRANSLATOR_TEXT_SUBSCRIPTION_KEY");  
        $endpoint = $this->getParameter("TRANSLATOR_TEXT_ENDPOINT");
        $location = $this->getParameter("TRANSLATOR_LOCATION");

        $requestBody = array (
            array (
                'Text' => $text,
            ),
        );

        $content = json_encode($requestBody);

        $headers = "Content-type: application/json; charset=UTF-8\r\n" .
            "Content-length: " . strlen($content) . "\r\n" .
            "Ocp-Apim-Subscription-Key: " . $subscription_key ."\r\n" .
            "Ocp-Apim-Subscription-Region: " . $location . "\r\n";
            "X-ClientTraceId: " . $this->getGuild() . "\r\n";
    
        // NOTE: Use the key 'http' even if you are making an HTTPS request. See:
        // http://php.net/manual/en/function.stream-context-create.php
        $options = array (
            'http' => array (
                'header' => $headers,
                'method' => 'POST',
                'content' => $content
            )
        );

        $context  = stream_context_create ($options);
        return new Response(file_get_contents ($endpoint . $path . $params.'&textType=html', false, $context));
    }
    /**
     * Generates globally unique identifier
     *
     * @return string
     */
    private function getGuild() : string
    {
        if (!function_exists('com_create_guid')) {
            function com_create_guid() {
              return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                  mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
                  mt_rand( 0, 0xffff ),
                  mt_rand( 0, 0x0fff ) | 0x4000,
                  mt_rand( 0, 0x3fff ) | 0x8000,
                  mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
              );
            }
          }
        return com_create_guid();
    }
    
     /**
      * This endpoint fetches all supported languages from the translator service
     * @Route("/api/get_translator_languages", name="api_get_translator_languages")
     */
    public function get_translator_languages () : Response
    {
        $result = $this->getTranslatorLanguages();        
        return new Response(json_encode(json_decode($result), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    } 
       
    /**
     * This helper function gets a list of languages supported the translator service 
     *
     * @return void
     */
    private function getTranslatorLanguages () 
    {        
        $headers = "Content-type: text/xml\r\n";       
        $endpoint = $this->getParameter("TRANSLATOR_TEXT_ENDPOINT");
        $path = $this->getParameter("TRANSLATOR_LANGUAGE_PATH");
        
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
 