<?php

namespace App\Entity;

use App\Repository\AdminUserRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: AdminUserRepository::class)]
#[ApiResource(order: ['createdAt' => 'DESC'], normalizationContext: ['groups' => ['adminUser:read']], denormalizationContext: ['groups' => ['adminUser:write']])]
#[ORM\Table(name:"admin_user")]
#[ORM\HasLifecycleCallbacks]
class AdminUser implements UserInterface
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['adminUser:read'])]
    private $id;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private ?string $email = null;

    #[ORM\Column]
    #[Groups(['adminUser:read'])]
    private array $roles = [];

    #[ORM\Column(length: 50)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private string $firstName;

    #[ORM\Column(length: 50)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private string $surname;

    #[ORM\Column(length: 3)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private ?string $language = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['adminUser:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    private $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $lastLogin = null;

    #[ORM\Column(type: Types::GUID, nullable: true)]
    private ?string $azureAdId = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) (null !== $this->email) ? $this->email : Uuid::v4();
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): self
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getSurname(): ?string
    {
        return $this->surname;
    }

    public function setSurname(string $surname): self
    {
        $this->surname = $surname;

        return $this;
    }

    public function getLanguage(): ?string
    {
        return $this->language;
    }

    public function setLanguage(string $language): self
    {
        $this->language = $language;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;

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

    public function getLastLogin(): ?\DateTimeInterface
    {
        return $this->lastLogin;
    }

    public function setLastLogin(?\DateTimeInterface $lastLogin): self
    {
        $this->lastLogin = $lastLogin;

        return $this;
    }

    public function getAzureAdId(): ?string
    {
        return $this->azureAdId;
    }

    public function setAzureAdId(?string $azureAdId): self
    {
        $this->azureAdId = $azureAdId;

        return $this;
    }

    public function getPassword(): string
    {
        
    }

    public function setPassword(string $password): self
    {
        
    }

    public function getSalt(): ?string
    {
        return null;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {

    }
}
