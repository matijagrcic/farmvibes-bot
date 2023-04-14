<?php

namespace App\Entity;

use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\LocationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use App\Controller\LocationController;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Table(name: 'location')]
#[ORM\Entity(repositoryClass: LocationRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Location
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['location:read'])]
    private ?int $id = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 50)]
    #[Groups(['location:read', 'location:write'])]
    private ?string $name = null;

    #[ApiProperty(readableLink: false)]
    #[ORM\ManyToOne(targetEntity: AdministrativeUnit::class, inversedBy: 'locations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['location:read', 'location:write'])]
    private ?\App\Entity\AdministrativeUnit $type = null;

    #[ApiProperty(readableLink: false)]
    #[ORM\ManyToOne(targetEntity: Location::class, inversedBy: 'children')]
    #[Groups(['location:read', 'location:write'])]
    private ?\App\Entity\Location $parent = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Location>
     */
    #[ORM\OneToMany(targetEntity: Location::class, mappedBy: 'parent')]
    #[Groups(['location:write'])]
    private \Doctrine\Common\Collections\Collection $children;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::FLOAT, nullable: true)]
    #[Groups(['location:read', 'location:write'])]
    private ?float $latitude = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::FLOAT, nullable: true)]
    #[Groups(['location:read', 'location:write'])]
    private ?float $longitude = null;
    
    public function __construct()
    {
        $this->children = new ArrayCollection();
    }
    public function getId() : ?int
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
    public function getType() : ?AdministrativeUnit
    {
        return $this->type;
    }
    public function setType(?AdministrativeUnit $type) : self
    {
        $this->type = $type;
        return $this;
    }
    public function getParent() : ?self
    {
        return $this->parent;
    }
    public function setParent(?self $parent) : self
    {
        $this->parent = $parent;
        return $this;
    }
    /**
     * @return Collection|self[]
     */
    public function getChildren() : Collection
    {
        return $this->children;
    }
    public function addChild(self $child) : self
    {
        if (!$this->children->contains($child)) {
            $this->children[] = $child;
            $child->setParent($this);
        }
        return $this;
    }
    public function removeChild(self $child) : self
    {
        if ($this->children->removeElement($child)) {
            // set the owning side to null (unless already changed)
            if ($child->getParent() === $this) {
                $child->setParent(null);
            }
        }
        return $this;
    }
    public function getLatitude() : ?float
    {
        return $this->latitude;
    }
    public function setLatitude(?float $latitude) : self
    {
        $this->latitude = $latitude;
        return $this;
    }
    public function getLongitude() : ?float
    {
        return $this->longitude;
    }
    public function setLongitude(?float $longitude) : self
    {
        $this->longitude = $longitude;
        return $this;
    }
}
