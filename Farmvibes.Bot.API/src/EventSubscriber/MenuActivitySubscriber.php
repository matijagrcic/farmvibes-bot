<?php

namespace App\EventSubscriber;

use App\Entity\MenuNode;
use App\Entity\MenuNodeType;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class MenuActivitySubscriber implements EventSubscriberInterface
{
    // this method can only return the event names; you cannot define a
    // custom method name to execute when each event triggers
    public function getSubscribedEvents(): array
    {
        return [
            // Events::postPersist,
            Events::prePersist,
            // Events::postRemove,
            // Events::postUpdate,
        ];
    }

    // callback methods must be called exactly like the events they listen to;
    // they receive an argument of type LifecycleEventArgs, which gives you access
    // to both the entity object of the event and the entity manager itself
    public function prePersist(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        $entityManager = $args->getObjectManager();
        if ($entity instanceof MenuNode && $entity->getType() == null) {
            $this->createRootNode($args, $entityManager, $entity);
        }
    }

    private function createRootNode(LifecycleEventArgs $args, $entityManager, $entity): void
    {
        $entity->setType($entityManager->getRepository(MenuNodeType::class)->find(1));
    }
}
