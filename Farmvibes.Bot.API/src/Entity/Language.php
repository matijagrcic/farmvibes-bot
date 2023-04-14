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

#[ApiResource(operations: [new Get(), new Patch(security: 'is_granted(\'ROLE_ADMIN\')', normalizationContext: ['groups' => ['translations']]), new Delete(security: 'is_granted(\'ROLE_ADMIN\')'), new Post(), new GetCollection()], normalizationContext: ['groups' => ['read']], denormalizationContext: ['groups' => ['write']], filters: ['translation.groups'])]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity]
class Language extends AbstractTranslatable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['read'])]
    private ?int $id = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['read'])]
    private $updatedAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN, nullable: true)]
    #[Groups(['read', 'write'])]
    private ?bool $isEnabled = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 5)]
    #[Groups(['read', 'write'])]
    private ?string $code = null;

    private $timezone = 'Africa/Nairobi';
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\LanguageTranslation>|\App\Entity\LanguageTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'LanguageTranslation', mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['write', 'translations'])]
    protected Collection $translations;

    #[Groups(['read'])]
    private $name;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN, nullable: true)]
    #[Groups(['read', 'write'])]
    private ?bool $isDefault = false;
    
    public function __construct()
    {
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        parent::__construct();
    }
    public function getId() : ?int
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
}
