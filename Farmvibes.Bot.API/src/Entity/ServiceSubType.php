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
use App\Repository\ServiceSubTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(normalizationContext: ['groups' => ['serviceSubType:read']], denormalizationContext: ['groups' => ['serviceSubType:write']])]
#[ORM\Entity(repositoryClass: ServiceSubTypeRepository::class)]
class ServiceSubType
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    private $id;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 100)]
    #[Groups(['serviceSubType:read', 'serviceSubType:write', 'service:read', 'onebot:read'])]
    private ?string $name = null;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255, nullable: true)]
    #[Groups(['serviceSubType:read', 'serviceSubType:write'])]
    private ?string $description = null;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Service>
     */
    #[ORM\OneToMany(targetEntity: Service::class, mappedBy: 'subtype')]
    
    private \Doctrine\Common\Collections\Collection $services;
    
    public function __construct()
    {
        $this->services = new ArrayCollection();
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
    public function getDescription() : ?string
    {
        return $this->description;
    }
    public function setDescription(?string $description) : self
    {
        $this->description = $description;
        return $this;
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
            $service->setSubtype($this);
        }
        return $this;
    }
    public function removeService(Service $service) : self
    {
        if ($this->services->removeElement($service)) {
            // set the owning side to null (unless already changed)
            if ($service->getSubtype() === $this) {
                $service->setSubtype(null);
            }
        }
        return $this;
    }
}
