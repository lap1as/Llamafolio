import { Navigate } from 'react-router-dom'

import { useLocalStorage } from '@shared/hooks'

interface GuardedRouteProps {
  element: JSX.Element
  conditions: string[]
  redirectPath: string
}

export const GuardedRoute: React.FC<GuardedRouteProps> = ({ element, conditions, redirectPath }) => {
  const [values] = useLocalStorage(conditions)

  const areAllValuesPresent = conditions.every((key) => values[key] !== null)

  return areAllValuesPresent ? element : <Navigate to={redirectPath} />
}
