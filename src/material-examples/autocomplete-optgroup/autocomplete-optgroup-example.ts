import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

@Component({
    selector: 'my-app',
    templateUrl: './autocomplete-optgroup-example.html',
    styleUrls: [ './autocomplete-optgroup-example.component.css' ],
    providers: []
})

export class AutocompleteOptionGroupExample implements OnInit {
    animalForm: FormGroup;
    
    speciesGroup: SpeciesGroup[] = [{
        letter : 'C', name : [ 'Castor', 'Cat']
    }, {
        letter : 'D',  name : [ 'Dog', 'Dragon']
    }];
    
    speciesGroupeOptions: Observable<SpeciesGroup[]>;
    
    constructor(private fb: FormBuilder) {
        this.buildForm();
    }
    
    ngOnInit() {
        this.speciesGroupeOptions = this.animalForm.get('speciesGroup').valueChanges
        .pipe(
            startWith(''),
            map(val => this.filterGroup(val))
        );
    }
    
    filterGroup(val: string): SpeciesGroup[] {
        if (val) {
            return this.speciesGroup
            .map(group => ({ letter: group.letter, name: this._filter(group.name, val) }))
            .filter(group => group.name.length > 0);
        }
        
        return this.speciesGroup;
    }
    
    private _filter(opt: string[], val: string) {
        const filterValue = val.toLowerCase();
        return opt.filter(item => item.toLowerCase().startsWith(filterValue));
    }
    
    buildForm() {
        this.animalForm = this.fb.group({
            species: ['', [Validators.required]],
            speciesGroup: ['', [Validators.required]]
        })
    };
}

class SpeciesGroup {
    letter:string;
    name: string[];
}