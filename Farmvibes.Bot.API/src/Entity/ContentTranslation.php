<?php

namespace App\Entity;

use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity]
#[UniqueEntity(fields: ['locale', 'label'])]
class ContentTranslation extends AbstractTranslation
{
    
    #[ORM\Id]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[ORM\GeneratedValue]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: 'Content', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255, nullable: true)]
    #[Assert\NotBlank]
    #[Groups(['content:read', 'content:write', 'translations'])]
    private ?string $label = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING)]
    #[Groups(['content:write', 'content:read', 'translations'])]
    protected ?string $locale = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): self
    {
        $this->label = $label;

        return $this;
    }
}