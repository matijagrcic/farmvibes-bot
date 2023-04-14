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
use ApiPlatform\Metadata\Link;
use Doctrine\DBAL\Types\Types;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(denormalizationContext: ['groups' => ['location:write']],normalizationContext: ['groups' => ['location:read']],operations:[new GetCollection()])] #[ApiResource(uriTemplate: '/locations/download_file', controller: LocationController::class, openapiContext: ['parameters' => [['name' => 'id', 'in' => 'path', 'description' => 'Downloads administrative units definition template file for the user to use in populating the locations table.', 'type' => 'array', 'required' => true, 'example' => 'administrative units ']]],
operations: [new GetCollection()], order: ['name' => 'ASC'])]
#[ApiResource(uriTemplate: '/locations/ux_columns', controller: LocationController::class, openapiContext: [],operations: [new GetCollection()])]
#[ApiResource(uriTemplate: '/administrative_unit/{typeId}/locations', 
    uriVariables: [
        'typeId' => new Link(
            fromClass: AdministrativeUnit::class,
            fromProperty: 'locations'
        )
    ],
    operations: [new GetCollection()],
    normalizationContext: ['groups' => ['constraints:ux']],
    openapiContext: ['parameters' => [['name' => 'typeId', 'in' => 'path', 'description' => 'This is the type of administrative unit by which we base our results on.', 'type' => 'integer', 'required' => true, 'example' => '4']]],
    paginationEnabled: false, order: ['name' => 'ASC']
)
]
#[ApiResource(
    uriTemplate: '/locations/ux_list/{type}/{page}/{locale}', 
    controller: LocationController::class, 
    openapiContext: [
        'parameters' => 
        [
            ['name' => 'type', 'in' => 'path', 'description' => 'This is the type of administrative unit by which we base our results on. By default, the UX will send the ID of the least administrative units in the tree.', 'type' => 'integer', 'required' => true, 'example' => '4'], 
            ['name' => 'page', 'in' => 'path', 'description' => 'It\'s not advisable to query all administrative units at once because we expect a huge number of results back. The default results per page is 15.', 'type' => 'integer', 'required' => true, 'example' => '1'],
            ['name' => 'locale', 'in' => 'path', 'description' => 'This determines the administrative unit language in the results', 'type' => 'string', 'required' => true, 'example' => 'en']
        ]],
        operations: [new GetCollection()])
]
#[ApiResource(uriTemplate: '/locations/upload_file', controller: LocationController::class, openapiContext: ['requestBody' => ['description' => 'File Upload', 'required' => true, 'content' => ['multipart/form-data' => ['schema' => ['type' => 'object', 'properties' => ['file' => ['type' => 'string', 'format' => 'binary', 'description' => 'File to be uploaded'], 'backup' => ['description' => 'Whether the selected file for upload should be stored in the server storage.', 'type' => 'boolean', 'required' => true]]]]]]],operations: [new Post()])]
#[ORM\Table(name: 'location')]
#[ORM\Entity(repositoryClass: LocationRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Location
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['location:read','constraints:ux'])]
    private $id;

    #[ORM\Column(type: Types::STRING, length: 50)]
    #[Groups(['location:read', 'location:write','constraints:ux'])]
    private ?string $name = null;

    #[ApiProperty(readableLink: false)]
    #[ORM\ManyToOne(targetEntity: AdministrativeUnit::class, inversedBy: 'locations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['location:read', 'location:write'])]
    private ?AdministrativeUnit $type = null;

    #[ApiProperty(readableLink: false)]
    #[ORM\ManyToOne(targetEntity: Location::class, inversedBy: 'children')]
    #[Groups(['location:read', 'location:write'])]
    private ?Location $parent = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<Location>
     */
    #[ORM\OneToMany(targetEntity: Location::class, mappedBy: 'parent')]
    #[Groups(['location:write'])]
    private Collection $children;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['location:read', 'location:write'])]
    private ?float $latitude = null;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['location:read', 'location:write'])]
    private ?float $longitude = null;
    
    public function __construct()
    {
        $this->children = new ArrayCollection();
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