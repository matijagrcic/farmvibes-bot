<?php

namespace App\EventListener;

use App\Entity\MenuNode;
use App\Entity\Language;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\EntityManagerInterface;

class DatabaseOnFlushListener
{
    /**
     * @param OnFlushEventArgs $eventArgs
     */
    public function onFlush(OnFlushEventArgs $eventArgs): void
    {
        $em = $eventArgs->getObjectManager();
        $uow = $em->getUnitOfWork();
        // Inserts
        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if ($entity instanceof MenuNode) {
                if ($entity->isIsDefault() == true) {
                    $oldDefault = $this->updateCurrentDefaultMenu($em);
                    $uow->recomputeSingleEntityChangeSet($em->getClassMetadata(get_class($oldDefault)), $oldDefault);
                    break;
                }
            }
        }

        //Updates
        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof MenuNode) {
                $uow->computeChangeSets();
                // We check if our default value has been changed
                $changeSet = $uow->getEntityChangeSet($entity);
                if ($changeSet && isset($changeSet['isDefault']) && $changeSet['isDefault'][1] === true) {
                    $oldDefault = $this->updateCurrentDefault($em, 'menu');
                    if ($oldDefault) {
                        $uow->computeChangeSet($em->getClassMetadata(get_class($oldDefault)), $oldDefault);
                    }
                    break;
                }

                //We need to publish all nodes.
                if ($changeSet && isset($changeSet['isPublished']) && $changeSet['isPublished'][1] === true && $entity->publish === 'all' && $entity->getRoot() === null) {
                    $nodes = $em->getRepository(Menu::class)->findAll(['root' => $entity->getId()]);
                    foreach ($nodes as $node) {
                        $node->setIsPubslished(true);
                        $em->persist($node);
                        $uow->computeChangeSet($em->getClassMetadata(get_class($node)), $node);
                    }
                    break;
                }
            }
            if ($entity instanceof Language) {
                if ($entity->getIsDefault() == true) {
                    $oldDefault = $this->updateCurrentDefault($em, 'language');
                    if ($oldDefault) {
                        $uow->computeChangeSet($em->getClassMetadata(get_class($oldDefault)), $oldDefault);
                    }
                    break;
                }
            }
        }

        //Deletes. 
        foreach ($uow->getScheduledEntityDeletions() as $entity) {
        }
    }

    public function updateCurrentDefault(EntityManagerInterface $em, string $entity)
    {
        if ($entity == 'menu')
            $oldDefault = $em->getRepository(MenuNode::class)->findOneBy(['isDefault' => true]);
        else
            $oldDefault = $em->getRepository(Language::class)->findOneBy(['isDefault' => true]);
        if ($oldDefault) {
            $oldDefault->setIsDefault(false);
            $em->persist($oldDefault);
        }

        return  $oldDefault;
    }
}
