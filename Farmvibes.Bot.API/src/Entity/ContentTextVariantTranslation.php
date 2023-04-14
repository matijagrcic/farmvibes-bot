<?php

namespace App\Entity;

use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class ContentTextVariantTranslation extends AbstractTranslation
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['content:read', 'translations'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: 'ContentTextVariant', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 1000)]
    #[Groups(['content:read', 'content:write', 'translations'])]
    private ?string $text = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING)]
    #[Groups(['content:write', 'translations'])]
    protected ?string $locale = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getText(): ?string
    {
        return $this->text;
    }

    public function setText(string $text): self
    {
        $this->text = $text;

        return $this;
    }
}
