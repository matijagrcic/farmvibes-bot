<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
class ChannelTranslation extends AbstractTranslation
{    
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: 'Channel', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 150)]
    #[Assert\NotBlank]
    #[Groups(['channel:read', 'channel:write', 'content:read', 'translations'])]
    private ?string $name = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING)]
    #[Groups(['channel:write', 'translations'])]
    protected ?string $locale = null;


    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }
}

