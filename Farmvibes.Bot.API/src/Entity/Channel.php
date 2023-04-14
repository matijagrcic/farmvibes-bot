<?php

namespace App\Entity;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ChannelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(normalizationContext: ['groups' => ['channel:read']], denormalizationContext: ['groups' => ['channel:write']], filters: ['translation.groups'], order: ['name' => 'ASC'])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Channel extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['channel:read', 'botUser:read'])]
    private $id;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 30)]
    #[Groups(['channel:read', 'channel:write', 'content:read', 'botUser:read'])]
    protected ?string $name = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN, nullable: true)]
    #[Groups(['channel:read', 'channel:write'])]
    private ?bool $isEnabled = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\BotUserContact>
     */
    #[ORM\OneToMany(targetEntity: BotUserContact::class, mappedBy: 'channel', orphanRemoval: true)]
    private \Doctrine\Common\Collections\Collection $botUserContacts;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['channel:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['channel:read'])]
    private $updatedAt;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ChannelTranslation>|\App\Entity\ChannelTranslation[]
     */
    #[ORM\OneToMany(targetEntity: ChannelTranslation::class, mappedBy: 'translatable', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['channel:write', 'translations'])]
    protected Collection $translations;

    private $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 10, nullable: true)]
    #[Groups(['channel:read', 'channel:write'])]
    private ?string $postfix = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 10, nullable: true)]
    #[Groups(['channel:read', 'channel:write'])]
    private ?string $prefix = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255, nullable: true)]
    #[Groups(['channel:read', 'channel:write'])]
    private ?string $url = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER, nullable: true)]
    #[Groups(['channel:write'])]
    private ?int $characterLength = null;
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentTextVariant>
     */
    #[ORM\ManyToMany(targetEntity: 'ContentTextVariant', mappedBy: 'channels')]
    private \Doctrine\Common\Collections\Collection $contentTextVariants;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN)]
    #[Groups(['channel:read', 'channel:write'])]
    private ?bool $isRichText = false;

    public function __construct()
    {
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->contentTextVariants = new \Doctrine\Common\Collections\ArrayCollection();
        parent::__construct();
        $this->botUserContacts = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getName() : ?string
    {
        return $this->name;
    }
    public function setName(string $name) : self
    {
        $this->name = $name;
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
    public function __toString()
    {
        return $this->getName() === null ? "New" : $this->getName();
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave()
    {
        $this->createdAt = new \DateTimeImmutable('now', new \DateTimeZone($this->timezone));
    }
    /**
     * @throws \Exception
     */
    #[ORM\PreUpdate]
    public function beforeUpdate()
    {
        $this->updatedAt = new \DateTimeImmutable('now', new \DateTimeZone($this->timezone));
    }
    protected function createTranslation() : TranslationInterface
    {
        return new ChannelTranslation();
    }
    public function getPostfix() : ?string
    {
        return $this->postfix;
    }
    public function setPostfix(?string $postfix) : self
    {
        $this->postfix = $postfix;
        return $this;
    }
    public function getPrefix() : ?string
    {
        return $this->prefix;
    }
    public function setPrefix(?string $prefix) : self
    {
        $this->prefix = $prefix;
        return $this;
    }
    public function getUrl() : ?string
    {
        return $this->url;
    }
    public function setUrl(?string $url) : self
    {
        $this->url = $url;
        return $this;
    }
    public function getCharacterLength() : ?int
    {
        return $this->characterLength;
    }
    public function setCharacterLength(?int $characterLength) : self
    {
        $this->characterLength = $characterLength;
        return $this;
    }
    public function getIsRichText() : ?bool
    {
        return $this->isRichText;
    }
    public function setIsRichText(bool $isRichText) : self
    {
        $this->isRichText = $isRichText;
        return $this;
    }
}
