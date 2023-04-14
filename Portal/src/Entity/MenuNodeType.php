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
use App\Repository\MenuNodeTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource]
#[ORM\Entity(repositoryClass: MenuNodeTypeRepository::class)]
class MenuNodeType
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['read'])]
    private ?int $id = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 50)]
    #[Groups(['read'])]
    private ?string $name = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNode>
     */
    #[ORM\OneToMany(targetEntity: MenuNode::class, mappedBy: 'type', orphanRemoval: true)]
    private \Doctrine\Common\Collections\Collection $menuNodes;
    
    public function __construct()
    {
        $this->menuNodes = new ArrayCollection();
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
    /**
     * @return Collection|MenuNode[]
     */
    public function getMenuNodes() : Collection
    {
        return $this->menuNodes;
    }
    public function addMenuNode(MenuNode $menuNode) : self
    {
        if (!$this->menuNodes->contains($menuNode)) {
            $this->menuNodes[] = $menuNode;
            $menuNode->setType($this);
        }
        return $this;
    }
    public function removeMenuNode(MenuNode $menuNode) : self
    {
        if ($this->menuNodes->removeElement($menuNode)) {
            // set the owning side to null (unless already changed)
            if ($menuNode->getType() === $this) {
                $menuNode->setType(null);
            }
        }
        return $this;
    }
    public function __toString() : string
    {
        return $this->getName() == null ? 'New' : $this->getName();
    }
}
