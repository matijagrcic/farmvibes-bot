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
use App\Repository\AdministrativeUnitRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(normalizationContext: ['groups' => ['administrativeUnit:read']], denormalizationContext: ['groups' => ['administrativeUnit:write']], order: ['translations.name' => 'ASC'])]
#[ORM\Entity(repositoryClass: AdministrativeUnitRepository::class)]
#[ApiResource(filters: ['translation.groups'])]
#[ORM\HasLifecycleCallbacks]
class AdministrativeUnit extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['administrativeUnit:read'])]
    private $id;

    #[Groups(['administrativeUnit:read', 'administrativeUnit:write'])]
    private $name;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Location>
     */
    #[ORM\OneToMany(targetEntity: Location::class, mappedBy: 'type', orphanRemoval: true)]
    #[Groups(['administrativeUnit:write'])]
    private \Doctrine\Common\Collections\Collection $locations;

    #[ApiProperty(readableLink: false)]
    #[ORM\ManyToOne(targetEntity: AdministrativeUnit::class, inversedBy: 'children')]
    #[Groups(['administrativeUnit:write', 'administrativeUnit:read'])]
    private ?\App\Entity\AdministrativeUnit $parent = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\AdministrativeUnit>     
     */
    #[ORM\OneToMany(targetEntity: AdministrativeUnit::class, mappedBy: 'parent')]
    #[Groups(['administrativeUnit:write'])]
    private \Doctrine\Common\Collections\Collection $children;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\AdministrativeUnitTranslation>|\App\Entity\AdministrativeUnitTranslation[]
     */
    #[ORM\OneToMany(targetEntity: AdministrativeUnitTranslation::class, mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['administrativeUnit:write', 'translations'])]
    protected Collection $translations;

    public function __construct()
    {
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->locations = new ArrayCollection();
        $this->children = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getName() : ?string
    {
        return $this->getTranslation()->getName();
    }
    public function setName(string $name) : self
    {
        $this->getTranslation()->setName($name);
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new AdministrativeUnitTranslation();
    }
    /**
     * @return Collection|Location[]
     */
    public function getLocations() : Collection
    {
        return $this->locations;
    }
    public function addLocation(Location $location) : self
    {
        if (!$this->locations->contains($location)) {
            $this->locations[] = $location;
            $location->setType($this);
        }
        return $this;
    }
    public function removeLocation(Location $location) : self
    {
        if ($this->locations->removeElement($location)) {
            // set the owning side to null (unless already changed)
            if ($location->getType() === $this) {
                $location->setType(null);
            }
        }
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
    /**
     * @return Collection|AdministrativeUnitTranslation[]
     */
    public function getTranslations() : Collection
    {
        return $this->translations;
    }
    public function addAdministrativeUnitTranslation(AdministrativeUnitTranslation $translations) : self
    {
        if (!$this->translations->contains($translations)) {
            $this->translations[] = $translations;
            $translations->setTranslatable($this);
        }
        return $this;
    }
    public function removeAdministrativeUnitTranslation(AdministrativeUnitTranslation $translations) : self
    {
        if ($this->translations->removeElement($translations)) {
            // set the owning side to null (unless already changed)
            if ($translations->getTranslatable() === $this) {
                $translations->setTranslatable(null);
            }
        }
        return $this;
    }
}
