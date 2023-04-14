<?php

namespace App\Entity;

use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\BotUserContactRepository;
use App\Repository\ChannelRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(uriTemplate: '/bot_users/{id}/bot_user_contacts.{_format}', uriVariables: ['id' => new Link(fromClass: \App\Entity\BotUser::class, identifiers: ['id'], toProperty: 'user')], status: 200, operations: [new GetCollection()])]
#[ORM\Entity(repositoryClass: BotUserContactRepository::class)]
class BotUserContact
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    private $id;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 50)]
    #[Groups(['botUser:read', 'botUser:write'])]
    private ?string $value = null;

    #[ORM\ManyToOne(targetEntity: Channel::class, inversedBy: 'botUserContacts')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['botUser:read', 'botUser:write'])]
    private ?\App\Entity\Channel $channel = null;

    #[ORM\ManyToOne(targetEntity: BotUser::class, inversedBy: 'botUserContacts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\BotUser $user = null;
    
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getValue() : ?string
    {
        return $this->value;
    }
    public function setValue(string $value) : self
    {
        $this->value = $value;
        return $this;
    }
    public function getChannel() : ?Channel
    {
        return $this->channel;
    }
    public function setChannel(?Channel $channel) : self
    {
        $this->channel = $channel;
        return $this;
    }
    public function getUser() : ?BotUser
    {
        return $this->user;
    }
    public function setUser(?BotUser $user) : self
    {
        $this->user = $user;
        return $this;
    }
}
