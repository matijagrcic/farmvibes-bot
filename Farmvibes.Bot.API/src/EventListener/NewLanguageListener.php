<?php

namespace App\EventListener;

use App\Entity\Language;
use App\Message\LanguageMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Event\TerminateEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Psr\Log\LoggerInterface;

class NewLanguageListener
{
    private EntityManagerInterface $entityManagerInterface;
    private MessageBusInterface $bus;
    private LoggerInterface $logger;
    public function __construct(EntityManagerInterface $entityManagerInterface, LoggerInterface $logger, MessageBusInterface $bus)
    {
        $this->entityManagerInterface = $entityManagerInterface;
        $this->bus = $bus;
        $this->logger = $logger;
    }
    public function onKernelTerminate(TerminateEvent $event): void
    {

        /**
         * Because the function can be called multiple times, let's 
         * make sure it only runs on the main request
         *  
         * */
        if (!$event->isMainRequest()) {
            return;
        }

        /**
         * Request will also be called for all routes, we are only interested in
         * creation of languages i.e. post call.
         * Run bin/console debug:router to get list of routes
         */
        $request = $event->getRequest();

        if ('_api_/languages{._format}_post' != $request->get('_route')) {
            return;
        }

        /**
         * We will get value of new language from response object.
         * We will check for persistence in DB but this can be removed
         * in the future for optimisation purposes, i.e avoid DB call.
         * 
         */
        $response = $event->getResponse();


        try {
            $language = $this->getLanguage($response);

            //Dispatch message to queue
            $this->bus->dispatch(new LanguageMessage($language->getCode(), $language->isIsTranslatable()));
        } catch (\Throwable $th) {
            $message = 'Error during background language task set-up: ' . $th->getMessage();
            $this->logger->error($message);
        }
    }

    private function getLanguage(Response $response): ?Language
    {
        $content = \json_decode($response->getContent(), true);
        if (!$content || empty($content["id"])) {
            return null;
        }
        return $this->entityManagerInterface->getRepository(Language::class)->find($content["id"]);
    }
}
