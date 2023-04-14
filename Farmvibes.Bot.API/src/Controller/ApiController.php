<?php
namespace App\Controller;
 
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Service\TranslationService;
use Symfony\Component\HttpFoundation\JsonResponse;

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
     * 
     * @param  mixed $request
     * @return Response
     */
    public function get_translation (Request $request, TranslationService $translationService) : JsonResponse
    {    
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $data = json_decode($request->getContent(), true);
        }
        else
            $data = $request->query->all();

        $result = $translationService->getTranslations($data);

        return new JsonResponse($result);
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
    public function get_translator_languages (TranslationService $translationService) : Response
    {
        $result = $translationService->getTranslationLanguages();        
        return new Response(json_encode(json_decode($result), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    } 
}
 