<?php

namespace App\Entity;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\BotUserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use App\Controller\UserByChannelId;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;

#[ApiResource(operations: [new Get(), new Patch(), new Delete(), new Put(), new Get(uriTemplate: '/bot_users/{channelId}/find', controller: UserByChannelId::class, read: false, openapiContext: ['parameters' => [['name' => 'channelId', 'in' => 'path', 'description' => 'The id of user assigned by channel', 'type' => 'string', 'required' => true, 'example' => '254722123456']]]), new Post(), new GetCollection()], order: ['createdAt' => 'DESC'], normalizationContext: ['groups' => ['botUser:read']], denormalizationContext: ['groups' => ['botUser:write']])]
#[ApiFilter(SearchFilter::class, properties: ['botUserContacts.value' => 'exact', 'botUserContacts.channel_id' => 'exact'])]
#[ORM\Entity(repositoryClass: BotUserRepository::class)]
#[ORM\HasLifecycleCallbacks]
class BotUser
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['botUser:read'])]
    private $id;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 50)]
    #[Groups(['botUser:read', 'botUser:write'])]
    #[Assert\NotBlank]
    private ?string $fullname = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['botUser:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 40)]
    #[Groups(['botUser:read', 'botUser:write'])]
    #[Assert\NotBlank]
    private ?string $status = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 3)]
    #[Groups(['botUser:read', 'botUser:write'])]
    #[Assert\NotBlank]
    private ?string $language = null;
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\BotUserContact>
     */
    #[ApiSubresource]
    #[ORM\OneToMany(targetEntity: BotUserContact::class, mappedBy: 'user', orphanRemoval: true, cascade: ['PERSIST'])]
    #[Groups(['botUser:read', 'botUser:write'])]
    #[Assert\NotBlank]
    private \Doctrine\Common\Collections\Collection $botUserContacts;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    private $updatedAt;

    private $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['botUser:read', 'botUser:write'])]
    private $profile = [];
    
    public function __construct()
    {
        $this->botUserContacts = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getFullname() : ?string
    {
        return $this->fullname;
    }
    public function setFullname(string $fullname) : self
    {
        $this->fullname = $fullname;
        return $this;
    }
    public function getcreatedAt() : ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
    public function setcreatedAt(\DateTimeImmutable $createdAt) : self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
    public function getStatus() : ?string
    {
        return $this->status;
    }
    public function setStatus(string $status) : self
    {
        $this->status = $status;
        return $this;
    }
    public function getLanguage() : ?string
    {
        return $this->language;
    }
    public function setLanguage(string $language) : self
    {
        $this->language = $language;
        return $this;
    }
    /**
     * @return Collection|BotUserContact[]
     */
    public function getBotUserContacts() : Collection
    {
        return $this->botUserContacts;
    }
    public function addBotUserContact(BotUserContact $botUserContact) : self
    {
        if (!$this->botUserContacts->contains($botUserContact)) {
            $this->botUserContacts[] = $botUserContact;
            $botUserContact->setUser($this);
        }
        return $this;
    }
    public function removeBotUserContact(BotUserContact $botUserContact) : self
    {
        if ($this->botUserContacts->removeElement($botUserContact)) {
            // set the owning side to null (unless already changed)
            if ($botUserContact->getUser() === $this) {
                $botUserContact->setUser(null);
            }
        }
        return $this;
    }
    public function getAge() : ?string
    {
        return $this->age;
    }
    public function setAge(?string $age) : self
    {
        $this->age = $age;
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
    public function beforeUpdate()
    {
        $this->setUpdatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave()
    {
        $this->setCreatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
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
    public function getProfile() : ?array
    {
        return $this->profile;
    }
    public function setProfile(array $profile) : self
    {
        $this->profile = $profile;
        return $this;
    }
}
