<?php

namespace App\Entity;

use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
class ServiceTranslation extends AbstractTranslation
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['service:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: 'Service', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 150)]
    #[Groups(['service:read', 'service:write', 'translations'])]
    private ?string $name = null;

    /**
     * @var null|string
     */
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 5)]
    #[Groups(['service:read', 'translations', 'service:write'])]
    protected ?string $locale = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 500, nullable: true)]
    #[Groups(['service:read', 'translations', 'service:write'])]
    private ?string $introduction = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 500, nullable: true)]
    #[Groups(['service:read', 'translations', 'service:write'])]
    private ?string $conclusion = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getIntroduction(): ?string
    {
        return $this->introduction;
    }

    public function setIntroduction(?string $introduction): self
    {
        $this->introduction = $introduction;

        return $this;
    }

    public function getConclusion(): ?string
    {
        return $this->conclusion;
    }

    public function setConclusion(?string $conclusion): self
    {
        $this->conclusion = $conclusion;

        return $this;
    }
}
