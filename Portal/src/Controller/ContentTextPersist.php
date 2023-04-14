<?php
 
namespace App\Controller;
 
use App\Entity\ContentText;
use App\Entity\ContentTextVariant;
use App\Entity\ContentTextVariantTranslation;
use App\Entity\Content;
use App\Entity\Channel;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;

/**
 * This API controller class provides an endpoint for persisting content text with translations and channel information.
 */
#[AsController]
class ContentTextPersist extends AbstractController
{
    private $doctrine;

    public function __construct(PersistenceManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }
    
    public function __invoke(Request $request)
    {
        $repo = $this->doctrine->getRepository(ContentText::class);

        $em = $this->doctrine->getManager();

        $data = json_decode($request->getContent(),true);

        $contentText = null;

        foreach($data['contentTextVariants'] as $variant)
        {            
            if(array_key_exists('id',$variant))
            {
                $contentTextVariant = null;
                foreach($variant['id'] as $lang => $id)
                {
                    $translationObj = $doctrine->getRepository(ContentTextVariantTranslation::class)->find($id);
                    $translationObj->setText($variant['translations'][$lang]['text']);
                    $em->persist($translationObj);
                    if($contentTextVariant == null)
                        $contentTextVariant = $translationObj->getTranslatable();
                }
                foreach($variant['channels'] as $channel)
                {
                    $contentTextVariant->addChannel($doctrine->getRepository(Channel::class)->find(substr($channel, -1, strrpos($channel,'/'))));
                }
                $em->persist($contentTextVariant);
                $contentText = $contentTextVariant->getContentText();
            }
            else
            {
                $contentText = new ContentText();
                $contentTextVariant = new ContentTextVariant();
                $contentTextVariant->setContentText($contentText);
                foreach($variant['channels'] as $channel)
                {
                    $contentTextVariant->addChannel($doctrine->getRepository(Channel::class)->find(substr($channel, -1, strrpos($channel,'/'))));
                }
                foreach($variant['translations'] as $translation)
                {
                    $translationObj = new ContentTextVariantTranslation();
                    $translationObj->setText($translation['text']);
                    $translationObj->setLocale($translation['locale']);
                    $em->persist($translationObj);
                    $contentTextVariant->addTranslation($translationObj);
                }
                $em->persist($contentTextVariant);
            }            
        }
        $contentText->setContent($doctrine->getRepository(Content::class)->find($data['content']));

        $contentText->setRaw($data['raw']);

        $em->persist($contentText);
        $em->flush();

        return ['status' => '200'];
    }
}