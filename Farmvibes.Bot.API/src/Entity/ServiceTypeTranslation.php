<?php

namespace App\Entity;

use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
class ServiceTypeTranslation extends AbstractTranslation
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: 'ServiceType', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 150)]
    #[Groups(['read', 'write', 'translations'])]
    private ?string $name = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 300)]
    #[Groups(['read', 'write', 'translations'])]
    private ?string $description = null;

    /**
     * @var null|string
     */
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 20)]
    #[Groups(['read', 'translations', 'write'])]
    protected ?string $locale = null;

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getDescription(): ?string
    {
        return $this->name;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }
}
