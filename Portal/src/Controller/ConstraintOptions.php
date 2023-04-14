<?php
namespace App\Controller;

use App\Entity\Constraint;
use App\Entity\Channel;
use App\Entity\AdministrativeUnit;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;

#[AsController]
class ConstraintOptions extends AbstractController
{
    private $doctrine;

    public function __construct(PersistenceManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }
	/**
     * __invoke
     *
     * @param  string $id
	 * @param  string $entity
     */
	public function __invoke(string $id,string $entity)
    {
        $data = [];
		switch ($entity) {
			case 'channel':
				$records = $this->doctrine->getRepository(Channel::class)->findAll();
				foreach ($records as $record)
				{
					array_push($data,["id" => $record->getId(), "name" => $record->getName()]);
				}
				break;
			case 'administrativeUnit':
				$records = $this->doctrine->getRepository(AdministrativeUnit::class)->findAll();
				foreach ($records as $record)
				{
					array_push($data,["id" => $record->getId(), "name" => $record->getName()]);
				}
				break;
			default:
				break;
		}
		return $this->json($data);
    }
}