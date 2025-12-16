"""
Exemple de tests unitaires pour les utilitaires
"""

import pytest


@pytest.mark.unit
class TestUtils:
    """Tests pour les fonctions utilitaires"""

    def test_example_string_utility(self):
        """Test d'une fonction utilitaire de chaîne"""
        def capitalize_words(text):
            return ' '.join(word.capitalize() for word in text.split())
        
        result = capitalize_words('hello world')
        assert result == 'Hello World'

    def test_example_number_utility(self):
        """Test d'une fonction utilitaire numérique"""
        def calculate_percentage(part, total):
            if total == 0:
                return 0
            return round((part / total) * 100, 2)
        
        assert calculate_percentage(25, 100) == 25.0
        assert calculate_percentage(0, 100) == 0.0
        assert calculate_percentage(100, 0) == 0

