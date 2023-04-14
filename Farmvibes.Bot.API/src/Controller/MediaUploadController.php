<?php

namespace App\Controller;

use App\Entity\Media;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpFoundation\Request;

/**
 * This controller class provides an endpoint for uploading media file.
 */

class MediaUploadController extends AbstractController
{    
    /**
     * __invoke
     *
     * @param  mixed $request
     * @return void
     */
    public function __invoke(Request $request)
    {         
        $file = $request->files->get('file');
        if (!$file) {
            throw new BadRequestHttpException('"file" is required');
        }
        $mediaDescription = $request->get('description');
        $media = new Media(); 
        //At this point trigger file upload process to storage service 
        //which is handled by event handler.      
        $media->setFile($file);
        $media->setDescription($mediaDescription);
        return $media;       
    }

}
