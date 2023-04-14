<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\AdminUserRepository;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use App\State\AdminUserProvider;

#[ORM\Entity(repositoryClass: AdminUserRepository::class)]
#[ORM\Table(name: 'admin_users')]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(operations: [new Get(), new Patch(), new Delete(), new Put(), new Post(), new GetCollection()], normalizationContext: ['groups' => ['adminUser:read']], denormalizationContext: ['groups' => ['adminUser:write']])]
#[ApiFilter(SearchFilter::class, properties: ['email' => 'exact'])]
class AdminUser implements UserInterface, PasswordAuthenticatedUserInterface
{
    /**
     * Table row identifier.
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['adminUser:read'])]
    private ?int $id = null;
    /**
     * The email of the administrative user.
     */
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 180, unique: true)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private ?string $email = null;
    /**
     * Administrative user access levels are accessed through this field as a JSON array.
     */
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private $roles = [];
    /**
     * Administrative user username field.
     */
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 80)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private ?string $username = null;
    /**
     * Administrative user password.
     * @var string The hashed password
     */
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING)]
    private ?string $password = null;
    /**
     * Administrative user locale.
     * @see getLanguage 
     * @see setLanguage
     */
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 10)]
    #[Groups(['adminUser:read', 'adminUser:write'])]
    private ?string $language = "en";
    public function getId() : ?int
    {
        return $this->id;
    }
    public function getEmail() : ?string
    {
        return $this->email;
    }
    public function setEmail(string $email) : self
    {
        $this->email = $email;
        return $this;
    }
    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier() : string
    {
        return (string) $this->email;
    }
    /**
     * @deprecated since Symfony 5.3, use getUserIdentifier instead
     */
    public function getUsername() : string
    {
        return (string) $this->email;
    }
    /**
     * @see UserInterface
     */
    public function getRoles() : array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }
    public function setRoles(array $roles) : self
    {
        $this->roles = $roles;
        return $this;
    }
    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword() : string
    {
        return $this->password;
    }
    public function setPassword(string $password) : self
    {
        $this->password = $password;
        return $this;
    }
    /**
     * Returning a salt is only needed, if you are not using a modern
     * hashing algorithm (e.g. bcrypt or sodium) in your security.yaml.
     *
     * @see UserInterface
     */
    public function getSalt() : ?string
    {
        return null;
    }
    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }
    /**
     * Gets administrative user's username field as a string 
     *
     * @return string
     */
    public function __toString() : string
    {
        return $this->username;
    }
    /**
     * Return administrative user's language field as a string
     *
     * @return string|null
     */
    public function getLanguage() : ?string
    {
        return $this->language;
    }
    public function setLanguage(string $language) : self
    {
        $this->language = $language;
        return $this;
    }
}
