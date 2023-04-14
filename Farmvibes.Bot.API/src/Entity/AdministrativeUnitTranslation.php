<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\AdministrativeUnitTranslationRepository;
use Doctrine\ORM\Mapping as ORM;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;



#[ORM\Entity]
class AdministrativeUnitTranslation extends AbstractTranslation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['administrativeUnit:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: AdministrativeUnit::class, inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255)]
    #[Assert\NotBlank]
    #[Groups(['administrativeUnit:read', 'administrativeUnit:write', 'translations'])]
    private ?string $name = null;
    
     #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING)]
    #[Groups(['administrativeUnit:write', 'translations'])]
    protected ?string $locale = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }
}
