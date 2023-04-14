<?php

namespace App\Entity;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(
    operations: [
        new Get(), 
        new Patch(normalizationContext: ['groups' => ['translations','language:read']]), 
        new Delete(), 
        new Post(normalizationContext: ['groups' => ['translations','language:read']]), 
        new GetCollection(order: ['isDefault' => 'DESC', 'createdAt' => 'ASC'])
    ], 
        normalizationContext: ['groups' => ['language:read']], 
        denormalizationContext: ['groups' => ['language:write']], 
        filters: ['translation.groups']
        )
        ]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity]
class Language extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['language:read'])]
    private $id;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['language:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['language:read'])]
    private $updatedAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN, nullable: true)]
    #[Groups(['language:read', 'language:write'])]
    private ?bool $isEnabled = false;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 7, unique: true)]
    #[Groups(['language:read', 'language:write'])]
    private ?string $code = null;

    private $timezone = 'Africa/Nairobi';
    
    #[ORM\OneToMany(targetEntity: 'LanguageTranslation', mappedBy: 'translatable', fetch: 'EAGER', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['language:write', 'translations'])]
    protected Collection $translations;

    #[Groups(['language:read'])]
    private $name;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN, nullable: true)]
    #[Groups(['language:read', 'language:write'])]
    private ?bool $isDefault = false;

    #[ORM\Column(nullable: true)]
    #[Groups(['language:read', 'language:write'])]
    private ?bool $isTranslatable = false;
    
    public function __construct()
    {
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        parent::__construct();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getCreatedAt() : ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
    public function setCreatedAt(\DateTimeImmutable $createdAt) : self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
    public function getUpdatedAt() : ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt) : self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
    public function getIsEnabled() : ?bool
    {
        return $this->isEnabled;
    }
    public function setIsEnabled(bool $isEnabled) : self
    {
        $this->isEnabled = $isEnabled;
        return $this;
    }
    public function getCode() : ?string
    {
        return $this->code;
    }
    public function setCode(string $code) : self
    {
        $this->code = $code;
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new LanguageTranslation();
    }
    public function setName(string $name)
    {
        $this->getTranslation()->setName($name);
    }
    public function getName() : ?string
    {
        return $this->getTranslation()->getName();
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeUpdate()
    {
        $this->SetUpdatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave()
    {
        $this->setCreatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
    public function getIsDefault() : ?bool
    {
        return $this->isDefault;
    }
    public function setIsDefault(?bool $isDefault) : self
    {
        $this->isDefault = $isDefault;
        return $this;
    }

    public function isIsTranslatable(): ?bool
    {
        return $this->isTranslatable;
    }

    public function setIsTranslatable(?bool $isTranslatable): self
    {
        $this->isTranslatable = $isTranslatable;

        return $this;
    }
}
