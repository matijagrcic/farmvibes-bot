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
use App\Repository\InteractionsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Ramsey\Uuid\Guid\Guid;

#[ApiResource(operations: [new Get(), new Patch(), new Delete(), new Put(), new Post(), new GetCollection()], order: ['createdAt' => 'DESC'], normalizationContext: ['groups' => ['interactions:read']], denormalizationContext: ['groups' => ['interactions:write']])]
#[ORM\Entity(repositoryClass: InteractionsRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Interactions
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['interactions:read'])]
    private $id;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 50)]
    #[Groups(['interactions:read', 'interactions:write'])]
    #[Assert\NotBlank]
    private string $userId;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 50)]
    #[Groups(['interactions:read', 'interactions:write'])]
    #[Assert\NotBlank]
    private string $branchId;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 60)]
    #[Groups(['interactions:read', 'interactions:write'])]
    #[Assert\NotBlank]
    private string $conversationId;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['interactions:read', 'interactions:write'])]
    private $responses = [];

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 3)]
    #[Groups(['interactions:read', 'interactions:write'])]
    #[Assert\NotBlank]
    private string $language;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 20)]
    #[Groups(['interactions:read', 'interactions:write'])]
    #[Assert\NotBlank]
    private string $channel;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['interactions:read', 'interactions:write'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['interactions:read', 'interactions:write'])]
    private $endedAt;
    
    private $timezone = 'Africa/Nairobi';

    public function __construct()
    {}

    public function getId() : ?string
    {
        return $this->id;
    }
    public function setId(string $userId) : self
    {
        $this->userId = $userId;
        return $this;
    }

    public function getUserId() : ?string
    {
        return $this->userId;
    }
    public function setUserId(string $userId) : self
    {
        $this->userId = $userId;
        return $this;
    }

    public function getBranchId() : ?string
    {
        return $this->branchId;
    }

    public function setBranchId(string $branchId) : self
    {
        $this->branchId = $branchId;
        return $this;
    }

    public function getConversationId() : ?string
    {
        return $this->conversationId;
    }

    public function setConversationId(string $conversationId) : self
    {
        $this->conversationId = $conversationId;
        return $this;
    }

    public function getResponses() : ?array
    {
        return $this->responses;
    }
    public function setResponses(array $responses) : self
    {
        $this->responses = $responses;
        return $this;
    }
    public function getChannel() : ?string
    {
        return $this->channel;
    }
    public function setChannel(string $channel) : self
    {
        $this->channel = $channel;
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

    public function getcreatedAt() : ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
    public function setcreatedAt(\DateTimeImmutable $createdAt) : self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
  
    public function getendedAt() : ?\DateTimeImmutable
    {
        return $this->endedAt;
    }
    public function setendedAt(\DateTimeImmutable $endedAt) : self
    {
        $this->endedAt = $endedAt;
        return $this;
    }

    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave()
    {
        $this->setCreatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }

    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeEnd()
    {
        $this->setendedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
}
