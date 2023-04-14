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
use App\Repository\ServiceTypeRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Component\Serializer\Annotation\Groups;
#[ApiResource(normalizationContext: ['groups' => ['serviceType:read']], denormalizationContext: ['groups' => ['serviceType:write']], filters: ['translation.groups'])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class ServiceType extends AbstractTranslatable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['serviceType:read', 'service:read'])]
    
    private ?int $id = null;
    /**
     *  @var string
     */
    #[Groups(['serviceType:read'])]
    private $name;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255, nullable: true)]
    #[Groups(['serviceType:read'])]
    private ?string $description = null;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ServiceTypeTranslation>|\App\Entity\ServiceTypeTranslation[]
     */
    #[ORM\OneToMany(targetEntity: ServiceTypeTranslation::class, mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['serviceType:write', 'translations'])]
    protected Collection $translations;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Service>
     */
    #[ORM\OneToMany(targetEntity: Service::class, mappedBy: 'type', orphanRemoval: true)]
    
    private \Doctrine\Common\Collections\Collection $services;
    
    private $timezone = 'Africa/Nairobi';
    
    public function __construct()
    {
        parent::__construct();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->services = new ArrayCollection();
    }
    public function getId() : ?int
    {
        return $this->id;
    }
    public function getName() : ?string
    {
        return $this->getTranslation()->getName();
    }
    public function setName(string $name) : void
    {
        $this->getTranslation()->setName($name);
    }
    public function getDescription() : ?string
    {
        return $this->getTranslation()->getDescription();
    }
    public function setDescription(?string $description) : void
    {
        $this->getTranslation()->setDescription($description);
    }
    public function getTranslations() : Collection
    {
        return $this->translations;
    }
    public function __toString()
    {
        return $this->getName() === null ? "New" : $this->getName();
    }
    /**
     * @return Collection|Service[]
     */
    public function getServices() : Collection
    {
        return $this->services;
    }
    public function addService(Service $service) : self
    {
        if (!$this->services->contains($service)) {
            $this->services[] = $service;
            $service->setType($this);
        }
        return $this;
    }
    public function removeService(Service $service) : self
    {
        if ($this->services->removeElement($service)) {
            // set the owning side to null (unless already changed)
            if ($service->getType() === $this) {
                $service->setType(null);
            }
        }
        return $this;
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
        return new ServiceTypeTranslation();
    }
}
