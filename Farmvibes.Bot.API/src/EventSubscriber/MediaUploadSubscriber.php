<?php

namespace App\EventSubscriber;


use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;
use MicrosoftAzure\Storage\Blob\Models\CreateContainerOptions;
use MicrosoftAzure\Storage\Blob\Models\PublicAccessType;

use App\Entity\Media;


class MediaUploadSubscriber implements EventSubscriberInterface
{
    
    private $dsn;
    public function __construct(string $dsn)
    {
        $this->dsn = $dsn;
    }
    // this method can only return the event names; you cannot define a
    // custom method name to execute when each event triggers
    public function getSubscribedEvents(): array
    {
        return [
            Events::prePersist,
            Events::postRemove,
            Events::preUpdate,
        ];
    }

    // callback methods must be called exactly like the events they listen to;
    // they receive an argument of type LifecycleEventArgs, which gives you access
    // to both the entity object of the event and the entity manager itself
    public function prePersist(LifecycleEventArgs $args): void
    {
        $this->uploadBlob($args->getObject());
    }

    public function postRemove(LifecycleEventArgs $args): void
    {

        // if this subscriber only applies to certain entity types,
        // add some code to check the entity type as early as possible
        if (!$args->getObject() instanceof Media) {
            return;
        }
        $items =  explode("/", $args->getObject()->getPathUrl());
        $name = $items[count($items)-1];
        $container = strtolower($args->getObject()->getFileType());
        $this->deleteBlob($name, $container);
    }

    public function preUpdate(PreUpdateEventArgs $eventArgs): void
    {
        if (!$eventArgs->getEntity() instanceof Media) {
            return;
        }
        $items =  explode("/", $eventArgs->getEntity()->getPathUrl());
        $oldName = $items[count($items) - 1];
        $container = strtolower($eventArgs->getEntity()->getFileType());
        $this->deleteBlob($oldName, $container);
        $this->uploadBlob($eventArgs->getEntity());
    }

    public function uploadBlob($media)
    {
        // if this subscriber only applies to certain entity types,
        // add some code to check the entity type as early as possible
        if (!$media instanceof Media) {
            return;
        }

        $media->setFiletype($this->getFiletypeFromMime($media->getFile()->getMimeType()));

        $fileName = md5 ( uniqid () ) . '.' . $media->getFile()->guessExtension ();
            
        $media->getFile()->move (sys_get_temp_dir(), $fileName );  

        $fileToUpload = sys_get_temp_dir() . '/'. $fileName;

        $blobClient = BlobRestProxy::createBlobService($this->dsn);                
        
        //Read uploaded temporary file into stream before uploading to blob storage
         $content = fopen($fileToUpload, "r");//

        //remove the temporary file
        unlink($fileToUpload);
 
        //We'll try to upload into container, if it doesn't exist, this should throw an error so we can create
        //container in the catch
        try {
            $blobClient->createBlockBlob(strtolower($media->getFileType()), $fileName, $content);
        } catch (ServiceException $e) {
            // Handle exception based on error codes and messages.
            // Error codes and messages are here:
            // http://msdn.microsoft.com/library/azure/dd179439.aspx
            $code = $e->getCode();
            //Handle the resource not found error by creating the resource.
            if ($code == 404) {
                // Create container options object.
                $createContainerOptions = new CreateContainerOptions();
                $createContainerOptions->setPublicAccess(PublicAccessType::CONTAINER_AND_BLOBS);
                // Create container.
                $blobClient->createContainer(strtolower($media->getFileType()), $createContainerOptions);
                $blobClient->createBlockBlob(strtolower($media->getFileType()), $fileName, $content);
            }
        }
        
        $media->setPathUrl($blobClient->getBlobUrl(strtolower($media->getFileType()), $fileName));
        
        // clean up the file property as we won't need it anymore
        $media->setFile(null);

        return $media;

    }

    public function deleteBlob($oldName, $container)
    {
        try {
            $blobClient = BlobRestProxy::createBlobService($this->dsn);
            $blobClient->deleteBlob($container, $oldName);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function getFiletypeFromMime($mime) : string
    {
        $filetype = ucfirst(substr($mime, 0, strrpos($mime, "/")));
        if (($filetype == 'Application') || ($filetype == 'Text')) {
            $filetype = 'Document';
        }
        return $filetype;
    }
}
